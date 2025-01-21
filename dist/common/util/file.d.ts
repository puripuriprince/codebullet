import { z } from 'zod';
export declare const FileTreeNodeSchema: z.ZodType<FileTreeNode>;
export interface FileTreeNode {
    name: string;
    type: 'file' | 'directory';
    filePath: string;
    lastReadTime?: number;
    children?: FileTreeNode[];
}
export interface DirectoryNode extends FileTreeNode {
    type: 'directory';
    children: FileTreeNode[];
}
export interface FileNode extends FileTreeNode {
    type: 'file';
    lastReadTime: number;
}
export declare const FileVersionSchema: z.ZodObject<{
    path: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    content: string;
}, {
    path: string;
    content: string;
}>;
export type FileVersion = z.infer<typeof FileVersionSchema>;
export declare const ProjectFileContextSchema: z.ZodObject<{
    currentWorkingDirectory: z.ZodString;
    fileTree: z.ZodArray<z.ZodType<FileTreeNode, z.ZodTypeDef, FileTreeNode>, "many">;
    fileTokenScores: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>;
    knowledgeFiles: z.ZodRecord<z.ZodString, z.ZodString>;
    gitChanges: z.ZodObject<{
        status: z.ZodString;
        diff: z.ZodString;
        diffCached: z.ZodString;
        lastCommitMessages: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: string;
        diff: string;
        diffCached: string;
        lastCommitMessages: string;
    }, {
        status: string;
        diff: string;
        diffCached: string;
        lastCommitMessages: string;
    }>;
    changesSinceLastChat: z.ZodRecord<z.ZodString, z.ZodString>;
    shellConfigFiles: z.ZodRecord<z.ZodString, z.ZodString>;
    systemInfo: z.ZodObject<{
        platform: z.ZodString;
        shell: z.ZodString;
        nodeVersion: z.ZodString;
        arch: z.ZodString;
        homedir: z.ZodString;
        cpus: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        platform: string;
        shell: string;
        nodeVersion: string;
        arch: string;
        homedir: string;
        cpus: number;
    }, {
        platform: string;
        shell: string;
        nodeVersion: string;
        arch: string;
        homedir: string;
        cpus: number;
    }>;
    fileVersions: z.ZodArray<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path: string;
        content: string;
    }, {
        path: string;
        content: string;
    }>, "many">, "many">;
}, "strip", z.ZodTypeAny, {
    currentWorkingDirectory: string;
    fileTree: FileTreeNode[];
    fileTokenScores: Record<string, Record<string, number>>;
    knowledgeFiles: Record<string, string>;
    gitChanges: {
        status: string;
        diff: string;
        diffCached: string;
        lastCommitMessages: string;
    };
    changesSinceLastChat: Record<string, string>;
    shellConfigFiles: Record<string, string>;
    systemInfo: {
        platform: string;
        shell: string;
        nodeVersion: string;
        arch: string;
        homedir: string;
        cpus: number;
    };
    fileVersions: {
        path: string;
        content: string;
    }[][];
}, {
    currentWorkingDirectory: string;
    fileTree: FileTreeNode[];
    fileTokenScores: Record<string, Record<string, number>>;
    knowledgeFiles: Record<string, string>;
    gitChanges: {
        status: string;
        diff: string;
        diffCached: string;
        lastCommitMessages: string;
    };
    changesSinceLastChat: Record<string, string>;
    shellConfigFiles: Record<string, string>;
    systemInfo: {
        platform: string;
        shell: string;
        nodeVersion: string;
        arch: string;
        homedir: string;
        cpus: number;
    };
    fileVersions: {
        path: string;
        content: string;
    }[][];
}>;
export type ProjectFileContext = z.infer<typeof ProjectFileContextSchema>;
export declare const createFileBlock: (filePath: string, content: string) => string;
export declare const createFileBlockWithoutPath: (content: string) => string;
export declare const fileRegex: RegExp;
export declare const fileWithNoPathRegex: RegExp;
export declare const parseFileBlocks: (fileBlocks: string) => Record<string, string>;
export declare const parseFileBlocksWithoutPath: (fileBlocks: string) => string[];
export declare const createMarkdownFileBlock: (filePath: string, content: string) => string;
export declare const createSearchReplaceBlock: (search: string, replace: string) => string;
export declare function printFileTree(nodes: FileTreeNode[], depth?: number): string;
export declare function printFileTreeWithTokens(nodes: FileTreeNode[], fileTokenScores: Record<string, Record<string, number>>, path?: string[]): string;
export declare const ensureDirectoryExists: (baseDir: string) => void;
/**
 * Removes markdown code block syntax if present, including any language tag
 */
export declare const cleanMarkdownCodeBlock: (content: string) => string;
export declare function isValidFilePath(path: string): boolean;
