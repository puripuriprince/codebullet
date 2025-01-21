export declare const DEBUG_PARSING = false;
export declare function getFileTokenScores(projectRoot: string, filePaths: string[]): Promise<{
    [filePath: string]: {
        [token: string]: number;
    };
}>;
export declare function parseTokens(filePath: string): Promise<{
    numLines: number;
    identifiers: string[];
    calls: string[];
}>;
