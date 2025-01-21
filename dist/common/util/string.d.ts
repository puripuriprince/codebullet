export declare const truncateString: (str: string, maxLength: number) => string;
export declare const truncateStringWithMessage: (str: string, maxLength: number, message?: string) => string;
export declare const replaceNonStandardPlaceholderComments: (content: string, replacement: string) => string;
export declare const randBoolFromStr: (str: string) => boolean;
export declare const pluralize: (count: number, word: string) => string;
/**
 * Safely replaces all occurrences of a search string with a replacement string,
 * escaping special replacement patterns (like $) in the replacement string.
 */
export declare const capitalize: (str: string) => string;
export declare const safeReplace: (content: string, searchStr: string, replaceStr: string) => string;
export declare const hasLazyEdit: (content: string) => boolean;
