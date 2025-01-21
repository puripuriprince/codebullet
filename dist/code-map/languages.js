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
exports.getLanguageConfig = getLanguageConfig;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const tree_sitter_1 = __importDefault(require("tree-sitter"));
const tree_sitter_2 = require("tree-sitter");
const parse_1 = require("./parse");
const languageConfigs = [
    {
        extensions: ['.ts'],
        queryFile: 'tree-sitter-typescript-tags.scm',
        packageName: 'tree-sitter-typescript',
    },
    {
        extensions: ['.tsx'],
        queryFile: 'tree-sitter-typescript-tags.scm',
        packageName: 'tree-sitter-typescript',
    },
    {
        extensions: ['.js', '.jsx'],
        queryFile: 'tree-sitter-javascript-tags.scm',
        packageName: 'tree-sitter-javascript',
    },
    {
        extensions: ['.py'],
        queryFile: 'tree-sitter-python-tags.scm',
        packageName: 'tree-sitter-python',
    },
    {
        extensions: ['.java'],
        queryFile: 'tree-sitter-java-tags.scm',
        packageName: 'tree-sitter-java',
    },
    {
        extensions: ['.cs'],
        queryFile: 'tree-sitter-c_sharp-tags.scm',
        packageName: 'tree-sitter-c-sharp',
    },
    {
        extensions: ['.c', '.h'],
        queryFile: 'tree-sitter-c-tags.scm',
        packageName: 'tree-sitter-c',
    },
    {
        extensions: ['.cpp', '.hpp'],
        queryFile: 'tree-sitter-cpp-tags.scm',
        packageName: 'tree-sitter-cpp',
    },
    {
        extensions: ['.rs'],
        queryFile: 'tree-sitter-rust-tags.scm',
        packageName: 'tree-sitter-rust',
    },
    {
        extensions: ['.rb'],
        queryFile: 'tree-sitter-ruby-tags.scm',
        packageName: 'tree-sitter-ruby',
    },
    {
        extensions: ['.go'],
        queryFile: 'tree-sitter-go-tags.scm',
        packageName: 'tree-sitter-go',
    },
    {
        extensions: ['.php'],
        queryFile: 'tree-sitter-php-tags.scm',
        packageName: 'tree-sitter-php',
    },
];
async function getLanguageConfig(filePath) {
    const extension = path.extname(filePath);
    const config = languageConfigs.find((config) => config.extensions.includes(extension));
    if (!config)
        return undefined;
    if (!config.parser) {
        const parser = new tree_sitter_1.default();
        try {
            const languageModule = await Promise.resolve(`${config.packageName}`).then(s => __importStar(require(s)));
            const language = extension === '.ts'
                ? languageModule.typescript
                : extension === '.tsx'
                    ? languageModule.tsx
                    : extension === '.php'
                        ? languageModule.php
                        : languageModule;
            parser.setLanguage(language);
            const queryFilePath = path.join(__dirname, 'tree-sitter-queries', config.queryFile);
            const queryString = fs.readFileSync(queryFilePath, 'utf8');
            config.query = new tree_sitter_2.Query(parser.getLanguage(), queryString);
            config.parser = parser;
            config.language = language;
        }
        catch (e) {
            if (parse_1.DEBUG_PARSING) {
                console.log('error', filePath, e);
            }
            return undefined;
        }
    }
    return config;
}
//# sourceMappingURL=languages.js.map