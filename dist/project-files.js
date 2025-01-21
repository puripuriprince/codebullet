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
exports.deleteFile = exports.getProjectFileContext = void 0;
exports.setProjectRoot = setProjectRoot;
exports.getProjectRoot = getProjectRoot;
exports.initProjectFileContextWithWorker = initProjectFileContextWithWorker;
exports.getChangesSinceLastFileVersion = getChangesSinceLastFileVersion;
exports.getFiles = getFiles;
exports.getExistingFiles = getExistingFiles;
exports.addScrapedContentToFiles = addScrapedContentToFiles;
exports.getFilesAbsolutePath = getFilesAbsolutePath;
exports.setFiles = setFiles;
exports.getFileBlocks = getFileBlocks;
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const diff_1 = require("diff");
const picocolors_1 = require("picocolors");
const worker_threads_1 = require("worker_threads");
const file_1 = require("./common/util/file");
const object_1 = require("./common/util/object");
const project_file_tree_1 = require("./common/project-file-tree");
const parse_1 = require("./code-map/parse");
const web_scraper_1 = require("./web-scraper");
const system_info_1 = require("./utils/system-info");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let projectRoot;
function setProjectRoot(dir) {
    const newDir = path_1.default.resolve(dir || getCurrentDirectory());
    if (fs_1.default.existsSync(newDir)) {
        if (projectRoot) {
            console.log((0, picocolors_1.green)('\nDirectory change:'), `Codebuff will read and write files in "${newDir}".\n`);
        }
        projectRoot = newDir;
        return newDir;
    }
    return projectRoot;
}
function getProjectRoot() {
    return projectRoot;
}
function getCurrentDirectory() {
    try {
        return process.cwd();
    }
    catch (error) {
        throw new Error('Failed to get current working directory. Is this directory deleted?', { cause: error });
    }
}
let cachedProjectFileContext;
function initProjectFileContextWithWorker(dir) {
    // NOTE: Uses the built worker-script-project-context.js within dist.
    // So you need to run `bun run build` before running locally.
    const workerPath = __filename.endsWith('.ts')
        ? path_1.default.join(__dirname, '..', 'dist', 'worker-script-project-context.js')
        : path_1.default.join(__dirname, 'worker-script-project-context.js');
    const worker = new worker_threads_1.Worker(workerPath);
    worker.postMessage({ dir });
    return new Promise((resolve, reject) => {
        worker.on('message', (initFileContext) => {
            worker.terminate();
            cachedProjectFileContext = initFileContext;
            resolve(initFileContext);
        });
    });
}
const getProjectFileContext = async (projectRoot, lastFileVersion, fileVersions) => {
    const gitChanges = await getGitChanges();
    const changesSinceLastChat = getChangesSinceLastFileVersion(lastFileVersion);
    const updatedProps = {
        gitChanges,
        changesSinceLastChat,
        fileVersions,
    };
    if (!cachedProjectFileContext ||
        cachedProjectFileContext.currentWorkingDirectory !== projectRoot) {
        const fileTree = (0, project_file_tree_1.getProjectFileTree)(projectRoot);
        const flattenedNodes = (0, project_file_tree_1.flattenTree)(fileTree);
        const allFilePaths = flattenedNodes
            .filter((node) => node.type === 'file')
            .map((node) => node.filePath);
        const knowledgeFilePaths = allFilePaths.filter((filePath) => filePath.endsWith('knowledge.md'));
        const knowledgeFiles = getExistingFiles(knowledgeFilePaths);
        const knowledgeFilesWithScrapedContent = await addScrapedContentToFiles(knowledgeFiles);
        const shellConfigFiles = loadShellConfigFiles();
        const fileTokenScores = await (0, parse_1.getFileTokenScores)(projectRoot, allFilePaths);
        cachedProjectFileContext = {
            currentWorkingDirectory: projectRoot,
            fileTree,
            fileTokenScores,
            knowledgeFiles: knowledgeFilesWithScrapedContent,
            shellConfigFiles,
            systemInfo: (0, system_info_1.getSystemInfo)(),
            ...updatedProps,
        };
    }
    else {
        cachedProjectFileContext = {
            ...cachedProjectFileContext,
            ...updatedProps,
        };
    }
    return cachedProjectFileContext;
};
exports.getProjectFileContext = getProjectFileContext;
async function getGitChanges() {
    try {
        const { stdout: status } = await execAsync('git status', {
            cwd: projectRoot,
        });
        const { stdout: diff } = await execAsync('git diff', { cwd: projectRoot });
        const { stdout: diffCached } = await execAsync('git diff --cached', {
            cwd: projectRoot,
        });
        const { stdout: shortLogOutput } = await execAsync('git shortlog HEAD~10..HEAD', {
            cwd: projectRoot,
        });
        const shortLogLines = shortLogOutput.trim().split('\n');
        const lastCommitMessages = shortLogLines
            .slice(1)
            .reverse()
            .map((line) => line.trim())
            .join('\n');
        return { status, diff, diffCached, lastCommitMessages };
    }
    catch (error) {
        return { status: '', diff: '', diffCached: '', lastCommitMessages: '' };
    }
}
function getChangesSinceLastFileVersion(lastFileVersion) {
    const changes = Object.entries(lastFileVersion)
        .map(([filePath, file]) => {
        const fullFilePath = path_1.default.join(getProjectRoot(), filePath);
        try {
            const currentContent = fs_1.default.readFileSync(fullFilePath, 'utf8');
            if (currentContent === file) {
                return [filePath, null];
            }
            return [filePath, (0, diff_1.createPatch)(filePath, file, currentContent)];
        }
        catch (error) {
            // console.error(`Error reading file ${fullFilePath}:`, error)
            return [filePath, null];
        }
    })
        .filter(([_, diff]) => diff !== null);
    return Object.fromEntries(changes);
}
function getFiles(filePaths) {
    const result = {};
    const MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes
    const ig = (0, project_file_tree_1.parseGitignore)(projectRoot);
    for (const filePath of filePaths) {
        // Convert absolute paths within project to relative paths
        const relativePath = filePath.startsWith(projectRoot)
            ? path_1.default.relative(projectRoot, filePath)
            : filePath;
        const fullPath = path_1.default.join(projectRoot, relativePath);
        if ((0, path_1.isAbsolute)(relativePath) || !fullPath.startsWith(projectRoot)) {
            result[relativePath] = '[FILE_OUTSIDE_PROJECT]';
            continue;
        }
        if (ig.ignores(relativePath)) {
            result[relativePath] = '[FILE_IGNORED]';
            continue;
        }
        try {
            const stats = fs_1.default.statSync(fullPath);
            if (stats.size > MAX_FILE_SIZE) {
                result[relativePath] =
                    `[FILE_TOO_LARGE: ${(stats.size / (1024 * 1024)).toFixed(2)}MB]`;
            }
            else {
                const content = fs_1.default.readFileSync(fullPath, 'utf8');
                result[relativePath] = content;
            }
        }
        catch (error) {
            result[relativePath] = null;
        }
    }
    return result;
}
function getExistingFiles(filePaths) {
    return (0, object_1.filterObject)(getFiles(filePaths), (value) => value !== null);
}
async function addScrapedContentToFiles(files) {
    const newFiles = { ...files };
    await Promise.all(Object.entries(files).map(async ([filePath, content]) => {
        const urls = (0, web_scraper_1.parseUrlsFromContent)(content);
        const scrapedContent = await (0, web_scraper_1.getScrapedContentBlocks)(urls);
        newFiles[filePath] =
            content +
                (scrapedContent.length > 0 ? '\n' : '') +
                scrapedContent.join('\n');
    }));
    return newFiles;
}
function getFilesAbsolutePath(filePaths) {
    const result = {};
    for (const filePath of filePaths) {
        try {
            const content = fs_1.default.readFileSync(filePath, 'utf8');
            result[filePath] = content;
        }
        catch (error) {
            result[filePath] = null;
        }
    }
    return result;
}
function setFiles(files) {
    for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path_1.default.join(projectRoot, filePath);
        fs_1.default.writeFileSync(fullPath, content, 'utf8');
    }
}
function getFileBlocks(filePaths) {
    const result = {};
    for (const filePath of filePaths) {
        const fullPath = path_1.default.join(projectRoot, filePath);
        try {
            const content = fs_1.default.readFileSync(fullPath, 'utf8');
            result[filePath] = content;
        }
        catch (error) {
            const fileDoesNotExist = error instanceof Error &&
                error.message.includes('no such file or directory');
            result[filePath] = fileDoesNotExist
                ? '[FILE_DOES_NOT_EXIST]'
                : '[FILE_READ_ERROR]';
            if (!fileDoesNotExist) {
                console.error(`Error reading file ${fullPath}:`, error instanceof Error ? error.message : error);
            }
        }
    }
    const fileBlocks = filePaths.map((filePath) => (0, file_1.createFileBlock)(filePath, result[filePath]));
    return fileBlocks.join('\n');
}
const loadShellConfigFiles = () => {
    const homeDir = os_1.default.homedir();
    const configFiles = [
        path_1.default.join(homeDir, '.bashrc'),
        path_1.default.join(homeDir, '.bash_profile'),
        path_1.default.join(homeDir, '.bash_login'),
        path_1.default.join(homeDir, '.profile'),
        path_1.default.join(homeDir, '.zshrc'),
        path_1.default.join(homeDir, '.kshrc'),
    ];
    const files = getFilesAbsolutePath(configFiles);
    return (0, object_1.filterObject)(files, (value) => value !== null);
};
/*
function getExportedTokensForFiles(
  filePaths: string[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  const fullFilePaths = filePaths.map((filePath) =>
    path.join(projectRoot, filePath)
  )
  const program = ts.createProgram(fullFilePaths, {})

  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i]
    const fullFilePath = fullFilePaths[i]
    const sourceFile = program.getSourceFile(fullFilePath)
    if (sourceFile) {
      try {
        const exportedTokens = getExportedTokens(sourceFile)
        result[filePath] = exportedTokens
      } catch (error) {
        console.error(`Error processing file ${fullFilePath}:`, error)
        result[filePath] = []
      }
    } else {
      // console.error(`Could not find source file: ${fullFilePath}`)
      result[filePath] = []
    }
  }

  return result
}

function getExportedTokens(sourceFile: ts.SourceFile): string[] {
  const exportedTokens: string[] = []

  function visit(node: ts.Node) {
    if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach((element) => {
          exportedTokens.push(element.name.text)
        })
      }
    } else if (
      ts.isFunctionDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isVariableStatement(node)
    ) {
      if (
        node.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
        )
      ) {
        if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
          if (node.name) {
            exportedTokens.push(node.name.text)
          }
        } else if (ts.isVariableStatement(node)) {
          node.declarationList.declarations.forEach((declaration) => {
            if (ts.isIdentifier(declaration.name)) {
              exportedTokens.push(declaration.name.text)
            }
          })
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return exportedTokens
}
*/
const deleteFile = (fullPath) => {
    try {
        if (fs_1.default.existsSync(fullPath)) {
            fs_1.default.unlinkSync(fullPath);
            return true;
        }
        return false;
    }
    catch (error) {
        console.error(`Error deleting file ${fullPath}:`, error);
        return false;
    }
};
exports.deleteFile = deleteFile;
//# sourceMappingURL=project-files.js.map