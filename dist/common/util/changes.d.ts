import { FileChanges } from '../actions';
export declare function applyChanges(projectRoot: string, changes: FileChanges): {
    created: string[];
    modified: string[];
};
export declare function applyAndRevertChanges(projectRoot: string, changes: FileChanges, onApply: () => Promise<void>): Promise<void>;
