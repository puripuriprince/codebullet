import { FileVersion } from './common/util/file';
export declare function setProjectRoot(dir: string | undefined): string;
export declare function getProjectRoot(): string;
export declare function initProjectFileContextWithWorker(dir: string): Promise<{
    currentWorkingDirectory: string;
    fileTree: import("./common/util/file").FileTreeNode[];
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
export declare const getProjectFileContext: (projectRoot: string, lastFileVersion: Record<string, string>, fileVersions: FileVersion[][]) => Promise<{
    currentWorkingDirectory: string;
    fileTree: import("./common/util/file").FileTreeNode[];
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
export declare function getChangesSinceLastFileVersion(lastFileVersion: Record<string, string>): {
    [k: string]: string;
};
export declare function getFiles(filePaths: string[]): Record<string, string | null>;
export declare function getExistingFiles(filePaths: string[]): Record<string, string>;
export declare function addScrapedContentToFiles(files: Record<string, string>): Promise<{
    [x: string]: string;
}>;
export declare function getFilesAbsolutePath(filePaths: string[]): Record<string, string | null>;
export declare function setFiles(files: Record<string, string>): void;
export declare function getFileBlocks(filePaths: string[]): string;
export declare const deleteFile: (fullPath: string) => boolean;
