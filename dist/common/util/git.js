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
exports.hasStagedChanges = hasStagedChanges;
exports.getStagedChanges = getStagedChanges;
exports.commitChanges = commitChanges;
exports.stageAllChanges = stageAllChanges;
exports.stagePatches = stagePatches;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function hasStagedChanges() {
    try {
        (0, child_process_1.execSync)('git diff --staged --quiet', { stdio: 'ignore' });
        return false;
    }
    catch {
        return true;
    }
}
function getStagedChanges() {
    try {
        return (0, child_process_1.execSync)('git diff --staged').toString();
    }
    catch (error) {
        return '';
    }
}
function commitChanges(commitMessage) {
    try {
        (0, child_process_1.execSync)(`git commit -m "${commitMessage}"`, { stdio: 'ignore' });
    }
    catch (error) { }
}
function stageAllChanges() {
    try {
        (0, child_process_1.execSync)('git add -A', { stdio: 'pipe' });
        return hasStagedChanges();
    }
    catch (error) {
        return false;
    }
}
function stagePatches(dir, changes) {
    try {
        const fileNames = changes.map((change) => change.filePath);
        const existingFileNames = fileNames.filter((filePath) => fs.existsSync(path.join(dir, filePath)));
        if (existingFileNames.length === 0) {
            return false;
        }
        (0, child_process_1.execSync)(`git add ${existingFileNames.join(' ')}`, { cwd: dir });
        return hasStagedChanges();
    }
    catch (error) {
        console.error('Error in stagePatches:', error);
        return false;
    }
}
//# sourceMappingURL=git.js.map