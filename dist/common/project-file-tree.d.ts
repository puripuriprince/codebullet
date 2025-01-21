import * as ignore from 'ignore';
import { FileTreeNode } from './util/file';
export declare function getProjectFileTree(projectRoot: string, { maxFiles }?: {
    maxFiles?: number;
}): FileTreeNode[];
export declare function parseGitignore(dirPath: string): ignore.Ignore;
export declare function getAllFilePaths(nodes: FileTreeNode[], basePath?: string): string[];
export declare function flattenTree(nodes: FileTreeNode[]): FileTreeNode[];
export declare function getLastReadFilePaths(flattenedNodes: FileTreeNode[], count: number): string[];
