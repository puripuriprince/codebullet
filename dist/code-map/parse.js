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
exports.DEBUG_PARSING = void 0;
exports.getFileTokenScores = getFileTokenScores;
exports.parseTokens = parseTokens;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const languages_1 = require("./languages");
exports.DEBUG_PARSING = false;
const IGNORE_TOKENS = ['__init__', '__post_init__', '__call__', 'constructor'];
async function getFileTokenScores(projectRoot, filePaths) {
    const startTime = Date.now();
    const tokenScores = {};
    const externalCalls = {};
    for (const filePath of filePaths) {
        const fullPath = path.join(projectRoot, filePath);
        if (!!(0, languages_1.getLanguageConfig)(fullPath)) {
            const { identifiers, calls, numLines } = await parseTokens(fullPath);
            const tokenScoresForFile = {};
            tokenScores[filePath] = tokenScoresForFile;
            const dirs = path.dirname(fullPath).split(path.sep);
            const depth = dirs.length;
            const tokenBaseScore = 0.8 ** depth * Math.sqrt(numLines / (identifiers.length + 1));
            for (const identifier of identifiers) {
                if (!IGNORE_TOKENS.includes(identifier)) {
                    tokenScoresForFile[identifier] = tokenBaseScore;
                }
            }
            for (const call of calls) {
                if (!tokenScoresForFile[call]) {
                    externalCalls[call] = (externalCalls[call] ?? 0) + 1;
                }
            }
        }
    }
    for (const scores of Object.values(tokenScores)) {
        for (const token of Object.keys(scores)) {
            const numCalls = externalCalls[token] ?? 0;
            if (typeof numCalls !== 'number')
                continue;
            scores[token] *= 1 + Math.log(1 + numCalls);
        }
    }
    if (exports.DEBUG_PARSING) {
        const endTime = Date.now();
        console.log(`Parsed ${filePaths.length} files in ${endTime - startTime}ms`);
        console.log('externalCalls', externalCalls);
        // Save exportedTokens to a file
        const exportedTokensFilePath = path.join(projectRoot, 'exported-tokens.json');
        try {
            fs.writeFileSync(exportedTokensFilePath, JSON.stringify(tokenScores, null, 2));
            console.log(`Exported tokens saved to ${exportedTokensFilePath}`);
        }
        catch (error) {
            console.error(`Failed to save exported tokens to file: ${error}`);
        }
    }
    return tokenScores;
}
async function parseTokens(filePath) {
    const languageConfig = await (0, languages_1.getLanguageConfig)(filePath);
    if (languageConfig) {
        const { parser, query } = languageConfig;
        try {
            const sourceCode = fs.readFileSync(filePath, 'utf8');
            const numLines = sourceCode.match(/\n/g)?.length ?? 0 + 1;
            const parseResults = parseFile(parser, query, sourceCode);
            const identifiers = parseResults.identifier;
            const calls = parseResults['call.identifier'];
            return {
                numLines,
                identifiers: identifiers ?? [],
                calls: calls ?? [],
            };
        }
        catch (e) {
            if (exports.DEBUG_PARSING) {
                console.error(`Error parsing query: ${e}`);
                console.log(filePath);
            }
        }
    }
    return {
        numLines: 0,
        identifiers: [],
        calls: [],
    };
}
function parseFile(parser, query, sourceCode) {
    const tree = parser.parse(sourceCode, undefined, {
        bufferSize: 1024 * 1024,
    });
    const captures = query.captures(tree.rootNode);
    const result = {};
    for (const capture of captures) {
        const { name, node } = capture;
        if (!result[name]) {
            result[name] = [];
        }
        result[name].push(node.text);
    }
    return result;
}
//# sourceMappingURL=parse.js.map