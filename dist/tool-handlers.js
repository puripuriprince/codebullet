"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolHandlers = exports.handleCodeSearch = exports.handleRunTerminalCommand = exports.handleScrapeWebPage = void 0;
const ripgrep_1 = require("@vscode/ripgrep");
const path_1 = __importDefault(require("path"));
const picocolors_1 = require("picocolors");
const child_process_1 = require("child_process");
const web_scraper_1 = require("./web-scraper");
const project_files_1 = require("./project-files");
const terminal_1 = require("./utils/terminal");
const string_1 = require("./common/util/string");
const handleScrapeWebPage = async (input, id) => {
    const { url } = input;
    const content = await (0, web_scraper_1.scrapeWebPage)(url);
    if (!content) {
        return `<web_scraping_error url="${url}">Failed to scrape the web page.</web_scraping_error>`;
    }
    return `<web_scraped_content url="${url}">${content}</web_scraped_content>`;
};
exports.handleScrapeWebPage = handleScrapeWebPage;
const handleRunTerminalCommand = async (input, id, mode) => {
    const { command } = input;
    return (0, terminal_1.runTerminalCommand)(command, mode);
};
exports.handleRunTerminalCommand = handleRunTerminalCommand;
const handleCodeSearch = async (input, id) => {
    return new Promise((resolve) => {
        let stdout = '';
        let stderr = '';
        const dir = (0, project_files_1.getProjectRoot)();
        const basename = path_1.default.basename(dir);
        const pattern = input.pattern.replace(/"/g, '');
        const command = `${path_1.default.resolve(ripgrep_1.rgPath)} "${pattern}" .`;
        console.log();
        console.log((0, picocolors_1.green)(`Searching ${basename} for "${pattern}":`));
        const childProcess = (0, child_process_1.spawn)(command, {
            cwd: dir,
            shell: true,
        });
        childProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        childProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        childProcess.on('close', (code) => {
            const lines = stdout.split('\n').filter((line) => line.trim());
            const maxResults = 3;
            const previewResults = lines.slice(0, maxResults);
            if (previewResults.length > 0) {
                console.log(previewResults.join('\n'));
                if (lines.length > maxResults) {
                    console.log('...');
                }
            }
            console.log((0, picocolors_1.green)(`Found ${lines.length} results\n`));
            const truncatedStdout = (0, string_1.truncateStringWithMessage)(stdout, 10000);
            const truncatedStderr = (0, string_1.truncateStringWithMessage)(stderr, 1000);
            resolve(formatResult(truncatedStdout, truncatedStderr, 'Code search completed', code));
        });
        childProcess.on('error', (error) => {
            resolve(`<terminal_command_error>Failed to execute ripgrep: ${error.message}</terminal_command_error>`);
        });
    });
};
exports.handleCodeSearch = handleCodeSearch;
exports.toolHandlers = {
    scrape_web_page: exports.handleScrapeWebPage,
    run_terminal_command: ((input, id) => (0, exports.handleRunTerminalCommand)(input, id, 'assistant').then((result) => result.result)),
    continue: async (input, id) => input.response ?? 'Please continue',
    code_search: exports.handleCodeSearch,
};
function formatResult(stdout, stderr, status, exitCode) {
    let result = '<terminal_command_result>\n';
    result += `<stdout>${stdout}</stdout>\n`;
    if (stderr !== undefined) {
        result += `<stderr>${stderr}</stderr>\n`;
    }
    result += `<status>${status}</status>\n`;
    if (exitCode !== null) {
        result += `<exit_code>${exitCode}</exit_code>\n`;
    }
    result += '</terminal_command_result>';
    return result;
}
//# sourceMappingURL=tool-handlers.js.map