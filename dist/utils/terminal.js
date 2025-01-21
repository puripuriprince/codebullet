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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTerminalCommand = exports.resetPtyShell = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const picocolors_1 = require("picocolors");
const os = __importStar(require("os"));
const detect_shell_1 = require("./detect-shell");
const project_files_1 = require("../project-files");
const string_1 = require("../common/util/string");
let pty;
const tempConsoleError = console.error;
console.error = () => { };
try {
    pty = require('@homebridge/node-pty-prebuilt-multiarch');
}
catch (error) {
}
finally {
    console.error = tempConsoleError;
}
const promptIdentifier = '@36261@';
const createPty = (dir) => {
    if (pty) {
        const isWindows = os.platform() === 'win32';
        const currShell = (0, detect_shell_1.detectShell)();
        const shell = isWindows
            ? currShell === 'powershell'
                ? 'powershell.exe'
                : 'cmd.exe'
            : 'bash';
        const shellWithoutExe = shell.split('.')[0];
        // Prepare shell init commands
        let shellInitCommands = '';
        if (!isWindows) {
            const rcFile = currShell === 'zsh'
                ? '~/.zshrc'
                : currShell === 'fish'
                    ? '~/.config/fish/config.fish'
                    : '~/.bashrc';
            shellInitCommands = `source ${rcFile} 2>/dev/null || true\n`;
        }
        else if (currShell === 'powershell') {
            // Try to source PowerShell profile if it exists
            shellInitCommands =
                '$PSProfile = $PROFILE.CurrentUserAllHosts; if (Test-Path $PSProfile) { . $PSProfile }\n';
        }
        const persistentPty = pty.spawn(shell, isWindows ? [] : ['--login'], {
            name: 'xterm-256color',
            cols: process.stdout.columns || 80,
            rows: process.stdout.rows || 24,
            cwd: dir,
            env: {
                ...process.env,
                PAGER: 'cat',
                GIT_PAGER: 'cat',
                GIT_TERMINAL_PROMPT: '0',
                ...(isWindows
                    ? {
                        TERM: 'cygwin',
                        ANSICON: '1', // Better ANSI support in cmd.exe
                        PROMPT: promptIdentifier,
                        PSModulePath: process.env.PSModulePath || '', // Preserve PowerShell modules
                    }
                    : {
                        TERM: 'xterm-256color',
                    }),
                LESS: '-FRX',
                TERM_PROGRAM: 'mintty',
                NO_COLOR: process.env.NO_COLOR, // Respect NO_COLOR if set
                FORCE_COLOR: '1', // Enable colors in CI/CD
                CI: process.env.CI, // Preserve CI environment
                // Locale settings for consistent output
                LANG: 'en_US.UTF-8',
                LC_ALL: 'en_US.UTF-8',
                // Shell-specific settings
                SHELL: shellWithoutExe,
            },
        });
        // Source the shell config file if available
        if (shellInitCommands) {
            persistentPty.write(shellInitCommands);
        }
        // Set prompt for Unix shells after sourcing config
        if (!isWindows) {
            persistentPty.write(`PS1='${promptIdentifier}'\n`);
        }
        return { type: 'pty', pty: persistentPty };
    }
    else {
        // Fallback to child_process
        const isWindows = os.platform() === 'win32';
        const currShell = (0, detect_shell_1.detectShell)();
        const shell = isWindows
            ? currShell === 'powershell'
                ? 'powershell.exe'
                : 'cmd.exe'
            : 'bash';
        return { type: 'process', shell };
    }
};
let persistentProcess = null;
process.stdout.on('resize', () => {
    if (!persistentProcess)
        return;
    const { pty } = persistentProcess;
    if (pty) {
        pty.resize(process.stdout.columns, process.stdout.rows);
    }
});
const resetPtyShell = (dir) => {
    if (persistentProcess) {
        if (persistentProcess.type === 'pty') {
            persistentProcess.pty.kill();
        }
    }
    persistentProcess = createPty(dir);
};
exports.resetPtyShell = resetPtyShell;
function formatResult(stdout, status) {
    let result = '<terminal_command_result>\n';
    result += `<output>${(0, string_1.truncateStringWithMessage)(stdout, 10000)}</output>\n`;
    result += `<status>${status}</status>\n`;
    result += '</terminal_command_result>';
    return result;
}
const isNotACommand = (output) => {
    return (output.includes('command not found') ||
        // Linux
        output.includes(': not found') ||
        // Common
        output.includes('syntax error:') ||
        output.includes('syntax error near unexpected token') ||
        // Linux
        output.includes('Syntax error:') ||
        // Windows
        output.includes('is not recognized as an internal or external command') ||
        output.includes('/bin/sh: -c: line') ||
        output.includes('/bin/sh: line') ||
        output.startsWith('fatal:') ||
        output.startsWith('error:') ||
        output.startsWith('Der Befehl') ||
        output.includes('konnte nicht gefunden werden') ||
        output.includes('wurde nicht als Name eines Cmdlet, einer Funktion, einer Skriptdatei oder eines ausführbaren'));
};
const runTerminalCommand = async (command, mode) => {
    const MAX_EXECUTION_TIME = 30_000;
    let projectRoot = (0, project_files_1.getProjectRoot)();
    return new Promise((resolve) => {
        if (!persistentProcess) {
            throw new Error('Shell not initialized');
        }
        if (persistentProcess.type === 'pty') {
            // Use PTY implementation
            const ptyProcess = persistentProcess.pty;
            let commandOutput = '';
            let foundFirstNewLine = false;
            if (mode === 'assistant') {
                console.log();
                console.log((0, picocolors_1.green)(`> ${command}`));
            }
            const timer = setTimeout(() => {
                if (mode === 'assistant') {
                    // Kill and recreate PTY
                    (0, exports.resetPtyShell)(projectRoot);
                    resolve({
                        result: formatResult(commandOutput, `Command timed out after ${MAX_EXECUTION_TIME / 1000} seconds and was terminated. Shell has been restarted.`),
                        stdout: commandOutput,
                    });
                }
            }, MAX_EXECUTION_TIME);
            const dataDisposable = ptyProcess.onData((data) => {
                // Trim first line if it's the prompt identifier
                if (commandOutput.trim() === '' &&
                    data.trimStart().startsWith(promptIdentifier)) {
                    data = data.trimStart().slice(promptIdentifier.length);
                }
                const prefix = commandOutput + data;
                // Skip the first line of the output, because it's the command being printed.
                if (!foundFirstNewLine) {
                    if (!prefix.includes('\n')) {
                        return;
                    }
                    foundFirstNewLine = true;
                    const newLineIndex = prefix.indexOf('\n');
                    data = prefix.slice(newLineIndex + 1);
                }
                // Try to detect error messages in the output
                if (mode === 'user' && isNotACommand(data)) {
                    clearTimeout(timer);
                    dataDisposable.dispose();
                    resolve({
                        result: 'command not found',
                        stdout: commandOutput,
                    });
                    return;
                }
                const promptDetected = prefix.includes(promptIdentifier);
                if (promptDetected) {
                    clearTimeout(timer);
                    dataDisposable.dispose();
                    if (command.startsWith('cd ') && mode === 'user') {
                        const newWorkingDirectory = command.split(' ')[1];
                        projectRoot = (0, project_files_1.setProjectRoot)(path_1.default.join(projectRoot, newWorkingDirectory));
                    }
                    if (mode === 'assistant') {
                        console.log((0, picocolors_1.green)(`Command completed`));
                    }
                    // Reset the PTY to the project root
                    ptyProcess.write(`cd ${projectRoot}\r`);
                    resolve({
                        result: formatResult(commandOutput, 'Command completed'),
                        stdout: commandOutput,
                    });
                    return;
                }
                process.stdout.write(data);
                commandOutput += data;
            });
            // Write the command
            ptyProcess.write(command + '\r');
        }
        else {
            // Fallback to child_process implementation
            const isWindows = os.platform() === 'win32';
            let commandOutput = '';
            if (mode === 'assistant') {
                console.log();
                console.log((0, picocolors_1.green)(`> ${command}`));
            }
            const childProcess = (0, child_process_1.spawn)(persistentProcess.shell, [isWindows ? '/c' : '-c', command], {
                cwd: projectRoot,
                env: {
                    ...process.env,
                    PAGER: 'cat',
                    GIT_PAGER: 'cat',
                    GIT_TERMINAL_PROMPT: '0',
                    LESS: '-FRX',
                },
            });
            const timer = setTimeout(() => {
                childProcess.kill();
                if (mode === 'assistant') {
                    resolve({
                        result: formatResult(commandOutput, `Command timed out after ${MAX_EXECUTION_TIME / 1000} seconds and was terminated.`),
                        stdout: commandOutput,
                    });
                }
            }, MAX_EXECUTION_TIME);
            childProcess.stdout.on('data', (data) => {
                const output = data.toString();
                process.stdout.write(output);
                commandOutput += output;
            });
            childProcess.stderr.on('data', (data) => {
                const output = data.toString();
                // Try to detect error messages in the output
                if (mode === 'user' && isNotACommand(output)) {
                    clearTimeout(timer);
                    childProcess.kill();
                    resolve({
                        result: 'command not found',
                        stdout: commandOutput,
                    });
                    return;
                }
                process.stdout.write(output);
                commandOutput += output;
            });
            childProcess.on('close', (code) => {
                clearTimeout(timer);
                if (command.startsWith('cd ') && mode === 'user') {
                    const newWorkingDirectory = command.split(' ')[1];
                    (0, project_files_1.setProjectRoot)(path_1.default.join(projectRoot, newWorkingDirectory));
                }
                if (mode === 'assistant') {
                    console.log((0, picocolors_1.green)(`Command completed`));
                }
                resolve({
                    result: formatResult(commandOutput, `Command completed`),
                    stdout: commandOutput,
                });
            });
        }
    });
};
exports.runTerminalCommand = runTerminalCommand;
//# sourceMappingURL=terminal.js.map