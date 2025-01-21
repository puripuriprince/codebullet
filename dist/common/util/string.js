"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasLazyEdit = exports.safeReplace = exports.capitalize = exports.pluralize = exports.randBoolFromStr = exports.replaceNonStandardPlaceholderComments = exports.truncateStringWithMessage = exports.truncateString = void 0;
const lodash_1 = require("lodash");
const truncateString = (str, maxLength) => {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength) + '...';
};
exports.truncateString = truncateString;
const truncateStringWithMessage = (str, maxLength, message = 'TRUNCATED_DUE_TO_LENGTH') => {
    return str.length > maxLength
        ? str.slice(0, maxLength) + `\n[...${message}]`
        : str;
};
exports.truncateStringWithMessage = truncateStringWithMessage;
const replaceNonStandardPlaceholderComments = (content, replacement) => {
    const commentPatterns = [
        // JSX comments (match this first)
        {
            regex: /{\s*\/\*\s*\.{3}.*(?:rest|unchanged|keep|file|existing|some).*(?:\s*\.{3})?\s*\*\/\s*}/gi,
            placeholder: replacement,
        },
        // C-style comments (C, C++, Java, JavaScript, TypeScript, etc.)
        {
            regex: /\/\/\s*\.{3}.*(?:rest|unchanged|keep|file|existing|some).*(?:\s*\.{3})?/gi,
            placeholder: replacement,
        },
        {
            regex: /\/\*\s*\.{3}.*(?:rest|unchanged|keep|file|existing|some).*(?:\s*\.{3})?\s*\*\//gi,
            placeholder: replacement,
        },
        // Python, Ruby, R comments
        {
            regex: /#\s*\.{3}.*(?:rest|unchanged|keep|file|existing|some).*(?:\s*\.{3})?/gi,
            placeholder: replacement,
        },
        // HTML-style comments
        {
            regex: /<!--\s*\.{3}.*(?:rest|unchanged|keep|file|existing|some).*(?:\s*\.{3})?\s*-->/gi,
            placeholder: replacement,
        },
        // SQL, Haskell, Lua comments
        {
            regex: /--\s*\.{3}.*(?:rest|unchanged|keep|file|existing|some).*(?:\s*\.{3})?/gi,
            placeholder: replacement,
        },
        // MATLAB comments
        {
            regex: /%\s*\.{3}.*(?:rest|unchanged|keep|file|existing|some).*(?:\s*\.{3})?/gi,
            placeholder: replacement,
        },
    ];
    let updatedContent = content;
    for (const { regex, placeholder } of commentPatterns) {
        updatedContent = updatedContent.replaceAll(regex, placeholder);
    }
    return updatedContent;
};
exports.replaceNonStandardPlaceholderComments = replaceNonStandardPlaceholderComments;
const randBoolFromStr = (str) => {
    return (0, lodash_1.sumBy)(str.split(''), (char) => char.charCodeAt(0)) % 2 === 0;
};
exports.randBoolFromStr = randBoolFromStr;
const pluralize = (count, word) => {
    if (count === 1)
        return `${count} ${word}`;
    // Handle words ending in 'y' (unless preceded by a vowel)
    if (word.endsWith('y') && !word.match(/[aeiou]y$/)) {
        return `${count} ${word.slice(0, -1) + 'ies'}`;
    }
    // Handle words ending in s, sh, ch, x, z, o
    if (word.match(/[sxz]$/) || word.match(/[cs]h$/) || word.match(/o$/)) {
        return `${count} ${word + 'es'}`;
    }
    // Handle words ending in f/fe
    if (word.endsWith('f')) {
        return `${count} ${word.slice(0, -1) + 'ves'}`;
    }
    if (word.endsWith('fe')) {
        return `${count} ${word.slice(0, -2) + 'ves'}`;
    }
    return `${count} ${word + 's'}`;
};
exports.pluralize = pluralize;
/**
 * Safely replaces all occurrences of a search string with a replacement string,
 * escaping special replacement patterns (like $) in the replacement string.
 */
const capitalize = (str) => {
    if (!str)
        return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
exports.capitalize = capitalize;
const safeReplace = (content, searchStr, replaceStr) => {
    const escapedReplaceStr = replaceStr.replace(/\$/g, '$$$$');
    return content.replace(searchStr, escapedReplaceStr);
};
exports.safeReplace = safeReplace;
const hasLazyEdit = (content) => {
    const cleanedContent = content.toLowerCase().trim();
    return (cleanedContent.includes('// rest of the') ||
        cleanedContent.includes('# rest of the') ||
        // Match various comment styles with ellipsis and specific words
        /\/\/\s*\.{3}.*(?:rest|unchanged|keep|file|existing|some).*(?:\.{3})?/.test(cleanedContent) || // C-style single line
        /\/\*\s*\.{3}.*(?:rest|unchanged|keep|file|existing|some).*(?:\.{3})?\s*\*\//.test(cleanedContent) || // C-style multi-line
        /#\s*\.{3}.*(?:rest|unchanged|keep|file|existing|some).*(?:\.{3})?/.test(cleanedContent) || // Python/Ruby style
        /<!--\s*\.{3}.*(?:rest|unchanged|keep|file|existing|some).*(?:\.{3})?\s*-->/.test(cleanedContent) || // HTML style
        /--\s*\.{3}.*(?:rest|unchanged|keep|file|existing|some).*(?:\.{3})?/.test(cleanedContent) || // SQL/Haskell style
        /%\s*\.{3}.*(?:rest|unchanged|keep|file|existing|some).*(?:\.{3})?/.test(cleanedContent) || // MATLAB style
        /{\s*\/\*\s*\.{3}.*(?:rest|unchanged|keep|file|existing|some).*(?:\.{3})?\s*\*\/\s*}/.test(cleanedContent) // JSX style
    );
};
exports.hasLazyEdit = hasLazyEdit;
//# sourceMappingURL=string.js.map