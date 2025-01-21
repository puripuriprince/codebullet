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
exports.cleanMarkdownCodeBlock = exports.ensureDirectoryExists = exports.createSearchReplaceBlock = exports.createMarkdownFileBlock = exports.parseFileBlocksWithoutPath = exports.parseFileBlocks = exports.fileWithNoPathRegex = exports.fileRegex = exports.createFileBlockWithoutPath = exports.createFileBlock = exports.ProjectFileContextSchema = exports.FileVersionSchema = exports.FileTreeNodeSchema = void 0;
exports.printFileTree = printFileTree;
exports.printFileTreeWithTokens = printFileTreeWithTokens;
exports.isValidFilePath = isValidFilePath;
const fs = __importStar(require("fs"));
const zod_1 = require("zod");
exports.FileTreeNodeSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.enum(['file', 'directory']),
    children: zod_1.z.lazy(() => zod_1.z.array(exports.FileTreeNodeSchema).optional()),
    filePath: zod_1.z.string(),
});
exports.FileVersionSchema = zod_1.z.object({
    path: zod_1.z.string(),
    content: zod_1.z.string(),
});
exports.ProjectFileContextSchema = zod_1.z.object({
    currentWorkingDirectory: zod_1.z.string(),
    fileTree: zod_1.z.array(zod_1.z.custom()),
    fileTokenScores: zod_1.z.record(zod_1.z.string(), zod_1.z.record(zod_1.z.string(), zod_1.z.number())),
    knowledgeFiles: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    gitChanges: zod_1.z.object({
        status: zod_1.z.string(),
        diff: zod_1.z.string(),
        diffCached: zod_1.z.string(),
        lastCommitMessages: zod_1.z.string(),
    }),
    changesSinceLastChat: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    shellConfigFiles: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    systemInfo: zod_1.z.object({
        platform: zod_1.z.string(),
        shell: zod_1.z.string(),
        nodeVersion: zod_1.z.string(),
        arch: zod_1.z.string(),
        homedir: zod_1.z.string(),
        cpus: zod_1.z.number(),
    }),
    fileVersions: zod_1.z.array(zod_1.z.array(exports.FileVersionSchema)),
});
const createFileBlock = (filePath, content) => {
    return ('<' +
        `edit_file path="${filePath}">
${content}
</edit_file` +
        '>');
};
exports.createFileBlock = createFileBlock;
const createFileBlockWithoutPath = (content) => {
    return ('<' +
        `edit_file>
${content}
</edit_file` +
        '>');
};
exports.createFileBlockWithoutPath = createFileBlockWithoutPath;
exports.fileRegex = /<edit_file path="([^"]+)">([\s\S]*?)<\/edit_file>/g;
exports.fileWithNoPathRegex = /<edit_file>([\s\S]*?)<\/edit_file>/g;
const parseFileBlocks = (fileBlocks) => {
    let fileMatch;
    const files = {};
    while ((fileMatch = exports.fileRegex.exec(fileBlocks)) !== null) {
        const [, filePath, fileContent] = fileMatch;
        files[filePath] = fileContent.startsWith('\n')
            ? fileContent.slice(1)
            : fileContent;
    }
    return files;
};
exports.parseFileBlocks = parseFileBlocks;
const parseFileBlocksWithoutPath = (fileBlocks) => {
    let fileMatch;
    const files = [];
    while ((fileMatch = exports.fileWithNoPathRegex.exec(fileBlocks)) !== null) {
        const [, fileContent] = fileMatch;
        files.push(fileContent.startsWith('\n') ? fileContent.slice(1) : fileContent);
    }
    return files;
};
exports.parseFileBlocksWithoutPath = parseFileBlocksWithoutPath;
const createMarkdownFileBlock = (filePath, content) => {
    return `\`\`\`${filePath}\n${content}\n\`\`\``;
};
exports.createMarkdownFileBlock = createMarkdownFileBlock;
const createSearchReplaceBlock = (search, replace) => {
    return `<<<<<<< SEARCH\n${search}\n=======\n${replace}\n>>>>>>> REPLACE`;
};
exports.createSearchReplaceBlock = createSearchReplaceBlock;
function printFileTree(nodes, depth = 0) {
    let result = '';
    const indentation = ' '.repeat(depth);
    for (const node of nodes) {
        result += `${indentation}${node.name}${node.type === 'directory' ? '/' : ''}\n`;
        if (node.type === 'directory' && node.children) {
            result += printFileTree(node.children, depth + 1);
        }
    }
    return result;
}
function printFileTreeWithTokens(nodes, fileTokenScores, path = []) {
    let result = '';
    const depth = path.length;
    const indentToken = ' ';
    const indentation = indentToken.repeat(depth);
    const indentationWithFile = indentToken.repeat(depth + 1);
    for (const node of nodes) {
        result += `${indentation}${node.name}${node.type === 'directory' ? '/' : ''}`;
        path.push(node.name);
        const filePath = path.join('/');
        const tokenScores = fileTokenScores[filePath];
        if (node.type === 'file' && tokenScores) {
            const tokens = Object.keys(tokenScores);
            if (tokens.length > 0) {
                result += `\n${indentationWithFile}${tokens.join(' ')}`;
            }
        }
        result += '\n';
        if (node.type === 'directory' && node.children) {
            result += printFileTreeWithTokens(node.children, fileTokenScores, path);
        }
        path.pop();
    }
    if (nodes.length === 0) {
        result = '[No files in this directory.]';
    }
    return result;
}
const ensureDirectoryExists = (baseDir) => {
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }
};
exports.ensureDirectoryExists = ensureDirectoryExists;
/**
 * Removes markdown code block syntax if present, including any language tag
 */
const cleanMarkdownCodeBlock = (content) => {
    const cleanResponse = content.match(/^```(?:[a-zA-Z]+)?\n([\s\S]*)\n```$/)
        ? content.replace(/^```(?:[a-zA-Z]+)?\n/, '').replace(/\n```$/, '')
        : content;
    return cleanResponse;
};
exports.cleanMarkdownCodeBlock = cleanMarkdownCodeBlock;
function isValidFilePath(path) {
    if (!path)
        return false;
    // Check for whitespace
    if (/\s/.test(path))
        return false;
    // Check for invalid characters
    const invalidChars = /[<>:"|?*\x00-\x1F]/g;
    if (invalidChars.test(path))
        return false;
    return true;
}
//# sourceMappingURL=file.js.map