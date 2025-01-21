"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = void 0;
const lodash_1 = require("lodash");
const project_file_tree_1 = require("./common/project-file-tree");
const changes_1 = require("./common/util/changes");
const readline = __importStar(require("readline"));
const picocolors_1 = require("picocolors");
const path_1 = require("path");
function rewriteLine(line) {
    // Only do line rewriting if we have an interactive TTY
    if (process.stdout.isTTY) {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(line);
    }
    else {
        process.stdout.write(line + '\n');
    }
}
const config_1 = require("./config");
const chat_storage_1 = require("./chat-storage");
const client_1 = require("./client");
const menu_1 = require("./menu");
const project_files_1 = require("./project-files");
const tool_handlers_1 = require("./tool-handlers");
const constants_1 = require("./common/constants");
const file_1 = require("./common/util/file");
const web_scraper_1 = require("./web-scraper");
const git_1 = require("./common/util/git");
const string_1 = require("./common/util/string");

/**
 * @typedef {Object} OpenRouterConfig
 * @property {string} model
 * @property {string} key
 */

class CLI {
    client;
    chatStorage;
    readyPromise;
    git;
    costMode;
    openRouter;
    rl;
    isReceivingResponse = false;
    stopResponse = null;
    loadingInterval = null;
    lastChanges = [];
    lastSigintTime = 0;
    lastInputTime = 0;
    consecutiveFastInputs = 0;
    pastedContent = '';
    isPasting = false;
    constructor(readyPromise, { git, costMode, openRouter }) {
        this.git = git;
        this.costMode = costMode;
        this.openRouter = openRouter;
        this.chatStorage = new chat_storage_1.ChatStorage();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            historySize: 1000,
            terminal: true,
            completer: (line) => {
                if (!this.client.fileContext?.fileTree)
                    return [[], line];
                const tokenNames = Object.values(this.client.fileContext.fileTokenScores).flatMap((o) => Object.keys(o));
                const paths = (0, project_file_tree_1.getAllFilePaths)(this.client.fileContext.fileTree);
                const lastWord = line.split(' ').pop() || '';
                const matchingTokens = [...tokenNames, ...paths].filter((token) => token.startsWith(lastWord) || token.includes('/' + lastWord));
                if (matchingTokens.length > 1) {
                    // Find common characters after lastWord
                    const suffixes = matchingTokens.map(token => {
                        const index = token.indexOf(lastWord);
                        return token.slice(index + lastWord.length);
                    });
                    let commonPrefix = '';
                    const firstSuffix = suffixes[0];
                    for (let i = 0; i < firstSuffix.length; i++) {
                        const char = firstSuffix[i];
                        if (suffixes.every(suffix => suffix[i] === char)) {
                            commonPrefix += char;
                        }
                        else {
                            break;
                        }
                    }
                    if (commonPrefix) {
                        // Match the common prefix
                        return [[lastWord + commonPrefix], lastWord];
                    }
                }
                return [matchingTokens, lastWord];
            },
        });
        this.client = new client_1.Client(
            config_1.websocketUrl, 
            this.chatStorage, 
            this.onWebSocketError.bind(this), 
            this.onWebSocketReconnect.bind(this), 
            this.returnControlToUser.bind(this), 
            costMode, 
            git,
            openRouter
        );
        this.readyPromise = Promise.all([
            readyPromise.then((results) => {
                const [_, fileContext] = results;
                this.client.initFileVersions(fileContext);
                return this.client.warmContextCache();
            }),
            this.client.connect(),
        ]);
        this.setPrompt();
        this.rl.on('line', (line) => {
            this.handleInput(line);
        });
        this.rl.on('SIGINT', () => {
            if (this.isReceivingResponse) {
                this.handleStopResponse();
            }
            else {
                const now = Date.now();
                if (now - this.lastSigintTime < 3000) {
                    // 3 second window
                    this.handleExit();
                }
                else {
                    this.lastSigintTime = now;
                    console.log('\nPress Ctrl-C again to exit');
                    this.rl.prompt();
                }
            }
        });
        this.rl.on('close', () => {
            this.handleExit();
        });
        process.on('SIGTSTP', () => {
            // Exit on Ctrl+Z
            this.handleExit();
        });
        process.stdin.on('keypress', (_, key) => {
            if (key.name === 'escape') {
                this.handleEscKey();
            }
            this.detectPasting();
        });
    }
    returnControlToUser() {
        this.rl.prompt();
        this.isReceivingResponse = false;
        if (this.stopResponse) {
            this.stopResponse();
        }
        this.stopLoadingAnimation();
    }
    onWebSocketError() {
        this.stopLoadingAnimation();
        this.isReceivingResponse = false;
        if (this.stopResponse) {
            this.stopResponse();
            this.stopResponse = null;
        }
        console.error((0, picocolors_1.yellow)('\nCould not connect. Retrying...'));
    }
    onWebSocketReconnect() {
        console.log((0, picocolors_1.green)('\nReconnected!'));
        this.returnControlToUser();
    }
    detectPasting() {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastInputTime;
        if (timeDiff < 10) {
            this.consecutiveFastInputs++;
            if (this.consecutiveFastInputs >= 2) {
                this.isPasting = true;
            }
        }
        else {
            this.consecutiveFastInputs = 0;
            if (this.isPasting) {
                this.isPasting = false;
            }
        }
        this.lastInputTime = currentTime;
    }
    handleInput(line) {
        this.detectPasting();
        if (this.isPasting) {
            this.pastedContent += line + '\n';
        }
        else if (!this.isReceivingResponse) {
            if (this.pastedContent) {
                this.handleUserInput((this.pastedContent + line).trim());
                this.pastedContent = '';
            }
            else {
                this.handleUserInput(line.trim());
            }
        }
    }
    setPrompt() {
        this.rl.setPrompt((0, picocolors_1.green)(`${(0, path_1.parse)((0, project_files_1.getProjectRoot)()).base} > `));
    }
    printInitialPrompt(initialInput) {
        if (this.client.user) {
            console.log(`\nWelcome back ${this.client.user.name}! What would you like to do?`);
        }
        else {
            console.log(`What would you like to do?\n`);
        }
        this.rl.prompt();
        if (initialInput) {
            process.stdout.write(initialInput + '\n');
            this.handleUserInput(initialInput);
        }
    }
    handleUndo() {
        this.navigateFileVersion('undo');
        this.rl.prompt();
    }
    handleRedo() {
        this.navigateFileVersion('redo');
        this.rl.prompt();
    }
    navigateFileVersion(direction) {
        const currentVersion = this.chatStorage.getCurrentVersion();
        const filePaths = Object.keys(currentVersion ? currentVersion.files : {});
        const currentFiles = (0, project_files_1.getExistingFiles)(filePaths);
        this.chatStorage.saveCurrentFileState(currentFiles);
        const navigated = this.chatStorage.navigateVersion(direction);
        if (navigated) {
            console.log(direction === 'undo'
                ? (0, picocolors_1.green)('Undo last change')
                : (0, picocolors_1.green)('Redo last change'));
            const files = this.applyAndDisplayCurrentFileVersion();
            console.log((0, picocolors_1.green)('Loaded files:'), (0, picocolors_1.green)(Object.keys(files).join(', ')));
        }
        else {
            console.log((0, picocolors_1.green)(`No more ${direction === 'undo' ? 'undo' : 'redo'}s`));
        }
    }
    handleStopResponse() {
        console.log((0, picocolors_1.yellow)('\n[Response stopped by user]'));
        this.isReceivingResponse = false;
        if (this.stopResponse) {
            this.stopResponse();
        }
        this.stopLoadingAnimation();
    }
    handleExit() {
        console.log('\n\n');
        console.log(`${(0, string_1.pluralize)(this.client.sessionCreditsUsed, 'credit')} used this session.`);
        if (!!this.client.limit &&
            !!this.client.usage &&
            !!this.client.nextQuotaReset) {
            const daysUntilReset = Math.max(0, Math.floor((this.client.nextQuotaReset.getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)));
            console.log(`${Math.max(0, this.client.limit - this.client.usage)} / ${this.client.limit} credits remaining. Renews in ${(0, string_1.pluralize)(daysUntilReset, 'day')}.`);
        }
        console.log((0, picocolors_1.green)('Codebuff out!'));
        process.exit(0);
    }
    handleEscKey() {
        if (this.isReceivingResponse) {
            this.handleStopResponse();
        }
    }
    applyAndDisplayCurrentFileVersion() {
        const currentVersion = this.chatStorage.getCurrentVersion();
        if (currentVersion) {
            (0, project_files_1.setFiles)(currentVersion.files);
            return currentVersion.files;
        }
        return {};
    }
    startLoadingAnimation() {
        const chars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let i = 0;
        this.loadingInterval = setInterval(() => {
            rewriteLine((0, picocolors_1.green)(`${chars[i]} Thinking...`));
            i = (i + 1) % chars.length;
        }, 100);
    }
    stopLoadingAnimation() {
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
            rewriteLine(''); // Clear the spinner line
        }
    }
    async autoCommitChanges() {
        if ((0, git_1.hasStagedChanges)()) {
            const stagedChanges = (0, git_1.getStagedChanges)();
            if (!stagedChanges)
                return;
            const commitMessage = await this.client.generateCommitMessage(stagedChanges);
            (0, git_1.commitChanges)(commitMessage);
            return commitMessage;
        }
        return undefined;
    }
    handleDiff() {
        if (this.lastChanges.length === 0) {
            console.log((0, picocolors_1.yellow)('No changes found in the last assistant response.'));
            return;
        }
        this.lastChanges.forEach((change) => {
            console.log('-', change.filePath);
            const lines = change.content
                .split('\n')
                .map((line) => (change.type === 'file' ? '+' + line : line));
            lines.forEach((line) => {
                if (line.startsWith('+')) {
                    console.log((0, picocolors_1.green)(line));
                }
                else if (line.startsWith('-')) {
                    console.log((0, picocolors_1.red)(line));
                }
                else {
                    console.log(line);
                }
            });
        });
    }
    async handleUserInput(userInput) {
        if (!userInput)
            return;
        userInput = userInput.trim();
        // Handle commands
        if (userInput === 'help' || userInput === 'h') {
            (0, menu_1.displayMenu)();
            this.rl.prompt();
            return;
        }
        if (userInput === 'login' || userInput === 'signin') {
            await this.client.login();
            return;
        }
        else if (userInput === 'logout' || userInput === 'signout') {
            await this.client.logout();
            this.rl.prompt();
            return;
        }
        else if (userInput.startsWith('ref-')) {
            await this.client.handleReferralCode(userInput.trim());
            return;
        }
        else if (userInput === 'usage' || userInput === 'credits') {
            this.client.getUsage();
            return;
        }
        else if (userInput === 'undo' || userInput === 'u') {
            this.handleUndo();
            return;
        }
        else if (userInput === 'redo' || userInput === 'r') {
            this.handleRedo();
            return;
        }
        else if (userInput === 'quit' ||
            userInput === 'exit' ||
            userInput === 'q') {
            this.handleExit();
            return;
        }
        else if (userInput === 'diff' ||
            userInput === 'doff' ||
            userInput === 'dif' ||
            userInput === 'iff' ||
            userInput === 'd') {
            this.handleDiff();
            this.rl.prompt();
            return;
        }
        const runPrefix = '/run ';
        const hasRunPrefix = userInput.startsWith(runPrefix);
        if (hasRunPrefix ||
            (!constants_1.SKIPPED_TERMINAL_COMMANDS.some((command) => userInput.toLowerCase().startsWith(command)) &&
                !userInput.includes('error ') &&
                userInput.split(' ').length <= 5)) {
            const withoutRunPrefix = userInput.replace(runPrefix, '');
            const { result, stdout } = await (0, tool_handlers_1.handleRunTerminalCommand)({ command: withoutRunPrefix }, 'user', 'user');
            if (result !== 'command not found') {
                this.setPrompt();
                this.rl.prompt();
                return;
            }
            else if (hasRunPrefix) {
                process.stdout.write(stdout);
                this.setPrompt();
                this.rl.prompt();
                return;
            }
        }
        this.startLoadingAnimation();
        await this.readyPromise;
        const currentChat = this.chatStorage.getCurrentChat();
        const { fileVersions } = currentChat;
        const currentFileVersion = fileVersions[fileVersions.length - 1]?.files ?? {};
        const changesSinceLastFileVersion = (0, project_files_1.getChangesSinceLastFileVersion)(currentFileVersion);
        const changesFileBlocks = Object.entries(changesSinceLastFileVersion)
            .map(([filePath, patch]) => [
            filePath,
            patch.length < 8_000
                ? patch
                : '[LARGE_FILE_CHANGE_TOO_LONG_TO_REPRODUCE]',
        ])
            .map(([filePath, patch]) => (0, file_1.createFileBlock)(filePath, patch));
        const changesMessage = changesFileBlocks.length > 0
            ? `<user_edits_since_last_chat>\n${changesFileBlocks.join('\n')}\n</user_edits_since_last_chat>\n\n`
            : '';
        const urls = (0, web_scraper_1.parseUrlsFromContent)(userInput);
        const scrapedBlocks = await (0, web_scraper_1.getScrapedContentBlocks)(urls);
        const scrapedContent = scrapedBlocks.length > 0 ? scrapedBlocks.join('\n\n') + '\n\n' : '';
        const newMessage = {
            role: 'user',
            content: `${changesMessage}${scrapedContent}${userInput}`,
        };
        this.chatStorage.addMessage(currentChat, newMessage);
        this.isReceivingResponse = true;
        const { response, changes, changesAlreadyApplied } = await this.sendUserInputAndAwaitResponse();
        this.isReceivingResponse = false;
        this.stopLoadingAnimation();
        const allChanges = [...changesAlreadyApplied, ...changes];
        const filesChanged = (0, lodash_1.uniq)(allChanges.map((change) => change.filePath));
        const allFilesChanged = this.chatStorage.saveFilesChanged(filesChanged);
        // Stage files about to be changed if flag was set
        if (this.git === 'stage' && changes.length > 0) {
            const didStage = (0, git_1.stagePatches)((0, project_files_1.getProjectRoot)(), changes);
            if (didStage) {
                console.log((0, picocolors_1.green)('\nStaged previous changes'));
            }
        }
        const { created, modified } = (0, changes_1.applyChanges)((0, project_files_1.getProjectRoot)(), changes);
        if (created.length > 0 || modified.length > 0) {
            console.log();
        }
        for (const file of created) {
            console.log((0, picocolors_1.green)(`- Created ${file}`));
        }
        for (const file of modified) {
            console.log((0, picocolors_1.green)(`- Updated ${file}`));
        }
        if (created.length > 0 || modified.length > 0) {
            if (this.client.lastRequestCredits > constants_1.REQUEST_CREDIT_SHOW_THRESHOLD) {
                console.log(`\n${(0, string_1.pluralize)(this.client.lastRequestCredits, 'credit')} used for this request.`);
            }
            console.log('Complete! Type "diff" to see the changes made.');
            this.client.showUsageWarning();
        }
        console.log();
        this.lastChanges = allChanges;
        const assistantMessage = {
            role: 'assistant',
            content: response,
        };
        this.chatStorage.addMessage(this.chatStorage.getCurrentChat(), assistantMessage);
        const updatedFiles = (0, project_files_1.getExistingFiles)(allFilesChanged);
        this.chatStorage.addNewFileState(updatedFiles);
        this.rl.prompt();
    }
    async sendUserInputAndAwaitResponse() {
        const userInputId = `mc-input-` + Math.random().toString(36).substring(2, 15);
        const { responsePromise, stopResponse } = this.client.subscribeToResponse(
            (chunk) => {
                process.stdout.write(chunk);
            }, 
            userInputId, 
            (model) => {
                this.stopLoadingAnimation();
                // Handle model name display for both OpenRouter and regular cases
                const modelDisplay = model ? ` [${model}]` : '';
                process.stdout.write((0, picocolors_1.green)((0, picocolors_1.underline)('\nCodebuff') + modelDisplay + ':') + ' ');
            }
        );
        
        this.stopResponse = stopResponse;
        this.client.sendUserInput([], userInputId);
        const result = await responsePromise;
        this.stopResponse = null;
        return result;
    }
}
exports.CLI = CLI;
//# sourceMappingURL=cli.js.map