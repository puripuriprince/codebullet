import { FileChanges } from '../actions';
export declare function hasStagedChanges(): boolean;
export declare function getStagedChanges(): string;
export declare function commitChanges(commitMessage: string): void;
export declare function stageAllChanges(): boolean;
export declare function stagePatches(dir: string, changes: FileChanges): boolean;
