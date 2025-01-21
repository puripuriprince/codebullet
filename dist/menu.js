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
exports.displayMenu = displayMenu;
const constants_1 = require("./common/constants");
const project_files_1 = require("./project-files");
const picocolors_1 = __importStar(require("picocolors"));
const picocolors_2 = require("picocolors");
const getRandomColors = () => {
    const allColors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
    const colors = [];
    while (colors.length < 3) {
        const color = allColors[Math.floor(Math.random() * allColors.length)];
        if (!colors.includes(color)) {
            colors.push(color);
        }
    }
    return colors;
};
function displayMenu() {
    const selectedColors = getRandomColors();
    const getRandomColor = () => {
        return selectedColors[Math.floor(Math.random() * selectedColors.length)];
    };
    const colorizeRandom = (text) => {
        return text
            .split('')
            .map((char) => {
            const color = getRandomColor();
            return picocolors_1.default[color](char);
        })
            .join('');
    };
    process.stdout.clearLine(0);
    console.log();
    console.log(`
${colorizeRandom('     { AI }')}
${colorizeRandom('    [CODER]')}
${colorizeRandom('          ')}
${colorizeRandom('██████╗')}${colorizeRandom(' ██████╗  ')}${colorizeRandom('██████╗ ')}${colorizeRandom('███████╗')}${colorizeRandom('██████╗ ')}${colorizeRandom('██╗   ██╗')}${colorizeRandom('███████╗')}${colorizeRandom('███████╗')}
${colorizeRandom('██╔════╝')}${colorizeRandom('██╔═══██╗')}${colorizeRandom('██╔══██╗')}${colorizeRandom('██╔════╝')}${colorizeRandom('██╔══██╗')}${colorizeRandom('██║   ██║')}${colorizeRandom('██╔════╝')}${colorizeRandom('██╔════╝')}
${colorizeRandom('██║     ')}${colorizeRandom('██║   ██║')}${colorizeRandom('██║  ██║')}${colorizeRandom('█████╗  ')}${colorizeRandom('██████╔╝')}${colorizeRandom('██║   ██║')}${colorizeRandom('█████╗  ')}${colorizeRandom('█████╗  ')}
${colorizeRandom('██║     ')}${colorizeRandom('██║   ██║')}${colorizeRandom('██║  ██║')}${colorizeRandom('██╔══╝  ')}${colorizeRandom('██╔══██╗')}${colorizeRandom('██║   ██║')}${colorizeRandom('██╔══╝  ')}${colorizeRandom('██╔══╝  ')}
${colorizeRandom('╚██████╗')}${colorizeRandom('╚██████╔╝')}${colorizeRandom('██████╔╝')}${colorizeRandom('███████╗')}${colorizeRandom('██████╔╝')}${colorizeRandom('╚██████╔╝')}${colorizeRandom('██║     ')}${colorizeRandom('██║     ')}
${colorizeRandom(' ╚═════╝')}${colorizeRandom(' ╚═════╝ ')}${colorizeRandom('╚═════╝ ')}${colorizeRandom('╚══════╝')}${colorizeRandom('╚═════╝ ')}${colorizeRandom(' ╚═════╝ ')}${colorizeRandom('╚═╝     ')}${colorizeRandom('╚═╝     ')}
`);
    console.log((0, picocolors_2.bold)((0, picocolors_2.green)("Welcome! I'm your AI coding assistant.")));
    console.log(`\nCodebuff will read and write files within your current directory (${(0, project_files_1.getProjectRoot)()}) and run commands in your terminal.`);
    console.log('\nASK CODEBUFF TO...');
    console.log('- Build a feature. Brain dump what you want first.');
    console.log('- Write unit tests');
    console.log('- Refactor a component into multiple components');
    console.log('- Fix errors from compiling your project or running tests');
    console.log('- Write a script.');
    console.log('- Plan a feature before implementing it. Or, write your own plan in a file and ask Codebuff to implement it step-by-step');
    console.log('- Build an integration after pasting in the URL to relevant documentation');
    console.log('- "Create knowledge files for your codebase" to help Codebuff understand your project');
    console.log('\nCOMMANDS');
    console.log('- Enter terminal commands directly: "cd backend", "npm test"');
    console.log('- Use "/run <command>" for long terminal commands');
    console.log('- Press ESC to cancel generation');
    console.log('- Type "undo" or "redo" (abbreviated "u" or "r") to undo or redo the last change');
    console.log('- Type "login" to log into Codebuff');
    console.log('- Type "exit" or press Ctrl+C twice to exit Codebuff');
    console.log('- Type "diff" or "d" to show changes from the last assistant response');
    console.log('- Start codebuff with --lite for efficient, budget responses or --max for higher quality responses');
    console.log(`- Redeem a referral code by simply pasting it here.`);
    console.log('-', (0, picocolors_2.bold)((0, picocolors_2.green)(`Refer new users and each of you will earn ${constants_1.CREDITS_REFERRAL_BONUS} credits per month: ${process.env.NEXT_PUBLIC_APP_URL}/referrals`)));
    console.log('\nAny files in .gitignore are not read by Codebuff. You can ignore further files with .codebuffignore');
    console.log('\nEmail your feedback to', (0, picocolors_2.bold)((0, picocolors_1.blue)('founders@codebuff.com.')), 'Thanks for using Codebuff!');
}
//# sourceMappingURL=menu.js.map