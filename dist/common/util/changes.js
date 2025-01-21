"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyChanges = applyChanges;
exports.applyAndRevertChanges = applyAndRevertChanges;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const patch_1 = require("./patch");
function applyChanges(projectRoot, changes) {
    const created = [];
    const modified = [];
    for (const change of changes) {
        const { filePath, content, type } = change;
        const fullPath = path_1.default.join(projectRoot, filePath);
        try {
            const fileExists = fs_1.default.existsSync(fullPath);
            if (!fileExists) {
                // Create directories in the path if they don't exist
                const dirPath = path_1.default.dirname(fullPath);
                fs_1.default.mkdirSync(dirPath, { recursive: true });
            }
            if (type === 'file') {
                fs_1.default.writeFileSync(fullPath, content);
            }
            else {
                const oldContent = fs_1.default.readFileSync(fullPath, 'utf-8');
                const newContent = (0, patch_1.applyPatch)(oldContent, content);
                fs_1.default.writeFileSync(fullPath, newContent);
            }
            if (fileExists) {
                modified.push(filePath);
            }
            else {
                created.push(filePath);
            }
        }
        catch (error) {
            console.error(`Failed to apply patch to ${filePath}:`, error, content);
        }
    }
    return { created, modified };
}
async function applyAndRevertChanges(projectRoot, changes, onApply) {
    const filesChanged = changes.map((change) => change.filePath);
    const files = Object.fromEntries(filesChanged.map((filePath) => {
        const fullPath = path_1.default.join(projectRoot, filePath);
        const oldContent = fs_1.default.existsSync(fullPath)
            ? fs_1.default.readFileSync(fullPath, 'utf-8')
            : '[DOES_NOT_EXIST]';
        return [filePath, oldContent];
    }));
    applyChanges(projectRoot, changes);
    try {
        await onApply();
    }
    catch (error) {
        console.error(`Failed to apply changes:`, error);
    }
    for (const [filePath, oldContent] of Object.entries(files)) {
        if (oldContent === '[DOES_NOT_EXIST]') {
            if (fs_1.default.existsSync(path_1.default.join(projectRoot, filePath))) {
                fs_1.default.unlinkSync(path_1.default.join(projectRoot, filePath));
            }
        }
        else {
            fs_1.default.writeFileSync(path_1.default.join(projectRoot, filePath), oldContent);
        }
    }
}
//# sourceMappingURL=changes.js.map