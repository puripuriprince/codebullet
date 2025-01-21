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
exports.getProjectFileTree = getProjectFileTree;
exports.parseGitignore = parseGitignore;
exports.getAllFilePaths = getAllFilePaths;
exports.flattenTree = flattenTree;
exports.getLastReadFilePaths = getLastReadFilePaths;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const ignore = __importStar(require("ignore"));
const lodash_1 = require("lodash");
const constants_1 = require("./constants");
function getProjectFileTree(projectRoot, { maxFiles = 10_000 } = {}) {
    const defaultIgnore = ignore.default();
    for (const pattern of constants_1.DEFAULT_IGNORED_FILES) {
        defaultIgnore.add(pattern);
    }
    if (projectRoot === os_1.default.homedir()) {
        defaultIgnore.add('.*');
        maxFiles = 1000;
    }
    const root = {
        name: path_1.default.basename(projectRoot),
        type: 'directory',
        children: [],
        filePath: '',
    };
    const queue = [
        {
            node: root,
            fullPath: projectRoot,
            ignore: defaultIgnore,
        },
    ];
    let totalFiles = 0;
    while (queue.length > 0 && totalFiles < maxFiles) {
        const { node, fullPath, ignore: currentIgnore } = queue.shift();
        const mergedIgnore = ignore
            .default()
            .add(currentIgnore)
            .add(parseGitignore(fullPath));
        try {
            const files = fs_1.default.readdirSync(fullPath);
            for (const file of files) {
                if (totalFiles >= maxFiles)
                    break;
                const filePath = path_1.default.join(fullPath, file);
                const relativeFilePath = path_1.default.relative(projectRoot, filePath);
                if (mergedIgnore.ignores(relativeFilePath))
                    continue;
                try {
                    const stats = fs_1.default.statSync(filePath);
                    if (stats.isDirectory()) {
                        const childNode = {
                            name: file,
                            type: 'directory',
                            children: [],
                            filePath: relativeFilePath,
                        };
                        node.children.push(childNode);
                        queue.push({
                            node: childNode,
                            fullPath: filePath,
                            ignore: mergedIgnore,
                        });
                    }
                    else {
                        const lastReadTime = stats.atimeMs;
                        node.children.push({
                            name: file,
                            type: 'file',
                            lastReadTime,
                            filePath: relativeFilePath,
                        });
                        totalFiles++;
                    }
                }
                catch (error) {
                    // Don't print errors, you probably just don't have access to the file.
                }
            }
        }
        catch (error) {
            // Don't print errors, you probably just don't have access to the directory.
        }
    }
    return root.children;
}
function parseGitignore(dirPath) {
    const ig = ignore.default();
    const gitignorePath = path_1.default.join(dirPath, '.gitignore');
    const codebuffignorePath = path_1.default.join(dirPath, '.codebuffignore');
    const manicodeignorePath = path_1.default.join(dirPath, '.manicodeignore');
    if (fs_1.default.existsSync(gitignorePath)) {
        const gitignoreContent = fs_1.default.readFileSync(gitignorePath, 'utf8');
        const lines = gitignoreContent.split('\n');
        for (const line of lines) {
            ig.add(line.startsWith('/') ? line.slice(1) : line);
        }
    }
    if (fs_1.default.existsSync(manicodeignorePath)) {
        const manicodeignoreContent = fs_1.default.readFileSync(manicodeignorePath, 'utf8');
        const lines = manicodeignoreContent.split('\n');
        for (const line of lines) {
            ig.add(line.startsWith('/') ? line.slice(1) : line);
        }
    }
    else if (fs_1.default.existsSync(codebuffignorePath)) {
        const codebuffignoreContent = fs_1.default.readFileSync(codebuffignorePath, 'utf8');
        const lines = codebuffignoreContent.split('\n');
        for (const line of lines) {
            ig.add(line.startsWith('/') ? line.slice(1) : line);
        }
    }
    return ig;
}
function getAllFilePaths(nodes, basePath = '') {
    return nodes.flatMap((node) => {
        if (node.type === 'file') {
            return [path_1.default.join(basePath, node.name)];
        }
        return getAllFilePaths(node.children || [], path_1.default.join(basePath, node.name));
    });
}
function flattenTree(nodes) {
    return nodes.flatMap((node) => {
        if (node.type === 'file') {
            return [node];
        }
        return flattenTree(node.children ?? []);
    });
}
function getLastReadFilePaths(flattenedNodes, count) {
    return (0, lodash_1.sortBy)(flattenedNodes.filter((node) => node.lastReadTime), 'lastReadTime')
        .reverse()
        .slice(0, count)
        .map((node) => node.filePath);
}
//# sourceMappingURL=project-file-tree.js.map