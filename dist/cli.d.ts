import { ProjectFileContext } from './common/util/file';
import { CliOptions } from './types';
export declare class CLI {
    private client;
    private chatStorage;
    private readyPromise;
    private git;
    private costMode;
    private rl;
    private isReceivingResponse;
    private stopResponse;
    private loadingInterval;
    private lastChanges;
    private lastSigintTime;
    private lastInputTime;
    private consecutiveFastInputs;
    private pastedContent;
    private isPasting;
    constructor(readyPromise: Promise<[void, ProjectFileContext]>, { git, costMode }: CliOptions);
    private returnControlToUser;
    private onWebSocketError;
    private onWebSocketReconnect;
    private detectPasting;
    private handleInput;
    private setPrompt;
    printInitialPrompt(initialInput?: string): void;
    private handleUndo;
    private handleRedo;
    private navigateFileVersion;
    private handleStopResponse;
    private handleExit;
    private handleEscKey;
    private applyAndDisplayCurrentFileVersion;
    private startLoadingAnimation;
    private stopLoadingAnimation;
    private autoCommitChanges;
    private handleDiff;
    private handleUserInput;
    private sendUserInputAndAwaitResponse;
}
