"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCodebuff = updateCodebuff;
const child_process_1 = require("child_process");
const picocolors_1 = require("picocolors");
const web_scraper_1 = require("./web-scraper");
const package_json_1 = __importDefault(require("../package.json"));
const config_1 = require("./config");
async function updateCodebuff() {
    if (!config_1.isProduction)
        return;
    const latestVersion = await getCodebuffNpmVersion();
    const isUpToDate = isNpmUpToDate(package_json_1.default.version, latestVersion);
    if (!isUpToDate) {
        const installerInfo = detectInstaller();
        if (!installerInfo) {
            console.log((0, picocolors_1.yellow)("There's a new version available! Please update Codebuff to prevent errors (run `npm install -g codebuff` to update)."));
            return;
        }
        console.log((0, picocolors_1.green)(`Updating Codebuff using ${installerInfo.installer}...`));
        try {
            runUpdateCodebuff(installerInfo);
            console.log((0, picocolors_1.green)('Codebuff updated successfully.'));
            console.log((0, picocolors_1.green)('Please restart by running `codebuff` to use the new version.'));
            process.exit(0);
        }
        catch (error) {
            console.error('Failed to update Codebuff.');
        }
    }
}
async function getCodebuffNpmVersion() {
    try {
        const result = (0, child_process_1.execSync)('npm view codebuff version', {
            encoding: 'utf-8',
            stdio: 'pipe', // Suppress all output
        });
        const versionMatch = result.match(/(\d+\.\d+\.\d+)/);
        if (versionMatch) {
            return versionMatch[1];
        }
    }
    catch (error) { }
    // Fallback to web scraping if npm command fails
    const url = 'https://www.npmjs.com/package/codebuff';
    const content = await (0, web_scraper_1.scrapeWebPage)(url);
    const latestVersionRegex = /"latest":"(\d+\.\d+\.\d+)"/;
    const match = content.match(latestVersionRegex);
    return match ? match[1] : '';
}
function isNpmUpToDate(currentVersion, latestVersion) {
    const current = currentVersion.split('.').map(Number);
    const latest = latestVersion.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if (current[i] < latest[i])
            return false;
        if (current[i] > latest[i])
            return true;
    }
    return true;
}
function detectInstaller() {
    let codebuffLocation = '';
    try {
        if (process.platform === 'win32') {
            codebuffLocation = (0, child_process_1.execSync)('where codebuff').toString().trim();
        }
        else {
            codebuffLocation = (0, child_process_1.execSync)('which codebuff').toString().trim();
        }
    }
    catch (error) {
        // Continue with empty location - could be a local installation
    }
    const binPath = (codebuffLocation.split('\n')[0] ?? '').replace(/\\/g, '/');
    const npmUserAgent = process.env.npm_config_user_agent ?? '';
    // Check for package manager script environments
    const isYarnScript = process.env.npm_lifecycle_script?.includes('yarn');
    const isPnpmScript = process.env.npm_lifecycle_script?.includes('pnpm');
    const isBunScript = process.env.npm_lifecycle_script?.includes('bun');
    const isNpmScript = process.env.npm_execpath?.endsWith('npm-cli.js') ||
        npmUserAgent.includes('npm');
    // Mac: /Users/jahooma/.yarn/bin/codebuff
    if (isYarnScript || binPath.includes('.yarn')) {
        return {
            installer: 'yarn',
            scope: binPath.includes('.yarn') ? 'global' : 'local',
        };
    }
    // Windows: ~/AppData/Local/pnpm/store
    // macOS: ~/Library/pnpm/store
    // Linux: ~/.local/share/pnpm/store
    if (isPnpmScript || binPath.includes('pnpm')) {
        return {
            installer: 'pnpm',
            scope: binPath.includes('pnpm') ? 'global' : 'local',
        };
    }
    // Mac: /Users/jahooma/.bun/install/cache
    if (isBunScript || binPath.includes('.bun')) {
        return {
            installer: 'bun',
            scope: binPath.includes('.bun') ? 'global' : 'local',
        };
    }
    // /usr/local/lib/node_modules on macOS/Linux or %AppData%\npm/node_modules on Windows
    // OR: .nvm/versions/node/v18.17.0/bin/codebuff on mac
    // OR /Users/stefan/Library/Application Support/Herd/config/nvm/versions/node/v22.9.0/bin/codebuff
    // OR ~/.config/nvm/versions/node/v22.11.0/bin/codebuff
    // OR /opt/homebrew/bin/codebuff
    const isGlobalNpmPath = binPath.includes('npm') ||
        binPath.startsWith('/usr/') ||
        binPath.includes('nvm/') ||
        binPath.includes('homebrew/bin');
    if (isNpmScript || isGlobalNpmPath) {
        return {
            installer: 'npm',
            scope: isGlobalNpmPath ? 'global' : 'local',
        };
    }
    return undefined;
}
function runUpdateCodebuff(installerInfo) {
    let command;
    const isGlobal = installerInfo.scope === 'global';
    switch (installerInfo.installer) {
        case 'npm':
            command = `npm ${isGlobal ? 'install -g' : 'install'} codebuff@latest`;
            break;
        case 'yarn':
            command = `yarn ${isGlobal ? 'global add' : 'add'} codebuff@latest`;
            break;
        case 'pnpm':
            command = `pnpm add ${isGlobal ? '-g' : ''} codebuff@latest`;
            break;
        case 'bun':
            command = `bun add ${isGlobal ? '-g' : ''} codebuff@latest`;
            break;
        default:
            throw new Error(`Unsupported installer: ${installerInfo.installer} ${installerInfo.scope}`);
    }
    (0, child_process_1.execSync)(command, { stdio: 'inherit' });
}
function restartCodebuff() {
    const child = (0, child_process_1.spawn)('codebuff', [...process.argv.slice(2), '--post-update'], {
        detached: false,
        stdio: 'inherit',
    });
    child.on('exit', (code) => {
        process.exit(code ?? 0);
    });
}
//# sourceMappingURL=update-codebuff.js.map