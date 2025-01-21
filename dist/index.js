#!/usr/bin/env node
process.env.ENVIRONMENT = 'production';
process.env.NEXT_PUBLIC_BACKEND_URL = 'manicode-backend.onrender.com';
process.env.NEXT_PUBLIC_APP_URL = 'https://www.codebuff.com';
process.env.NEXT_PUBLIC_SUPPORT_EMAIL = 'support@codebuff.com';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const picocolors_1 = require("picocolors");
const cli_1 = require("./cli");
const project_files_1 = require("./project-files");
const update_codebuff_1 = require("./update-codebuff");
const terminal_1 = require("./utils/terminal");
async function codebuff(projectDir, { initialInput, git, costMode, openRouter }) {
    const dir = (0, project_files_1.setProjectRoot)(projectDir);
    (0, terminal_1.resetPtyShell)(dir);
    const updatePromise = (0, update_codebuff_1.updateCodebuff)();
    const initFileContextPromise = (0, project_files_1.initProjectFileContextWithWorker)(dir);
    const readyPromise = Promise.all([updatePromise, initFileContextPromise]);
    const cli = new cli_1.CLI(readyPromise, { git, costMode, openRouter });
    const costModeDescription = {
        lite: (0, picocolors_1.bold)((0, picocolors_1.yellow)('Lite mode ✨ enabled')),
        normal: '',
        max: (0, picocolors_1.bold)((0, picocolors_1.blueBright)('Max mode️ ⚡ enabled')),
    };
    console.log(`${costModeDescription[costMode]}`);
    console.log(`Codebuff will read and write files in "${dir}". Type "help" for a list of commands.`);
    const gitDir = path_1.default.join(dir, '.git');
    if (!fs_1.default.existsSync(gitDir)) {
        console.warn((0, picocolors_1.yellow)('Warning: No .git directory found. Make sure you are at the top level of your project.'));
    }
    cli.printInitialPrompt(initialInput);
}
if (require.main === module) {
    const args = process.argv.slice(2);
    const help = args.includes('--help') || args.includes('-h');
    const gitArg = args.indexOf('--git');
    const git = gitArg !== -1 && args[gitArg + 1] === 'stage'
        ? 'stage'
        : undefined;
    if (gitArg !== -1) {
        args.splice(gitArg, 2);
    }
    const openRouterArg = args.indexOf('--openrouter');
    let openRouter = undefined;
    if (openRouterArg !== -1 && args.length > openRouterArg + 2) {
        openRouter = {
            model: args[openRouterArg + 1],
            key: args[openRouterArg + 2]
        };
        args.splice(openRouterArg, 3);
    }
    let costMode = 'normal';
    if (args.includes('--lite')) {
        costMode = 'lite';
        args.splice(args.indexOf('--lite'), 1);
    }
    else if (args.includes('--pro') ||
        args.includes('--o1') ||
        args.includes('--max')) {
        costMode = 'max';
        // Remove whichever flag was used
        if (args.includes('--pro')) {
            args.splice(args.indexOf('--pro'), 1);
            console.error((0, picocolors_1.red)('Warning: The --pro flag is deprecated. Please restart codebuff and use the --max option instead.'));
            process.exit(1);
        }
        if (args.includes('--o1'))
            args.splice(args.indexOf('--o1'), 1);
        if (args.includes('--max'))
            args.splice(args.indexOf('--max'), 1);
    }
    const projectPath = args[0];
    const initialInput = args.slice(1).join(' ');
    if (help) {
        console.log('Usage: codebuff [project-directory] [initial-prompt]');
        console.log('Both arguments are optional.');
        console.log('If no project directory is specified, Codebuff will use the current directory.');
        console.log('If an initial prompt is provided, it will be sent as the first user input.');
        console.log();
        console.log('Options:');
        console.log('  --lite                          Use budget models & fetch fewer files');
        console.log('  --max, --o1                     Use higher quality models and fetch more files');
        console.log('  --git stage                     Stage changes from last message');
        console.log('  --openrouter <model> <key>      Use a specific model through OpenRouter API');
        console.log();
        console.log('Codebuff allows you to interact with your codebase using natural language.');
        process.exit(0);
    }
    codebuff(projectPath, { initialInput, git, costMode, openRouter });
}
//# sourceMappingURL=index.js.map