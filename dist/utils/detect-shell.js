"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectShell = detectShell;
const os_1 = require("os");
const child_process_1 = require("child_process");
function detectShell() {
    // Get the parent process environment
    const shell = process.env.SHELL || process.env.COMSPEC || process.env.PSModulePath;
    try {
        // Handle Windows detection
        if ((0, os_1.platform)() === 'win32') {
            try {
                // Check if running in PowerShell
                (0, child_process_1.execSync)('$PSVersionTable', { stdio: 'pipe' });
                return 'powershell';
            }
            catch {
                // Check explicit CMD environment
                if (process.env.COMSPEC?.toLowerCase().includes('cmd.exe')) {
                    return 'cmd.exe';
                }
                // Check parent process as final Windows check
                const parentProcess = (0, child_process_1.execSync)('wmic process get ParentProcessId,CommandLine', { stdio: 'pipe' })
                    .toString()
                    .toLowerCase();
                if (parentProcess.includes('powershell'))
                    return 'powershell';
                if (parentProcess.includes('cmd.exe'))
                    return 'cmd.exe';
            }
        }
        // Handle Unix-like systems
        if (shell) {
            const shellLower = shell.toLowerCase();
            if (shellLower.includes('bash'))
                return 'bash';
            if (shellLower.includes('zsh'))
                return 'zsh';
            if (shellLower.includes('fish'))
                return 'fish';
        }
        // Try to get the parent process name on Unix systems
        if ((0, os_1.platform)() !== 'win32') {
            const ppid = process.ppid;
            const parentProcess = (0, child_process_1.execSync)(`ps -p ${ppid} -o comm=`, {
                stdio: 'pipe',
            })
                .toString()
                .trim();
            if (parentProcess)
                return parentProcess;
        }
    }
    catch (error) {
        // Log error if needed
        // console.error('Error detecting shell:', error);
    }
    return 'unknown';
}
//# sourceMappingURL=detect-shell.js.map