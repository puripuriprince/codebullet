import { User } from './common/util/credentials';
import { ChatStorage } from './chat-storage';
import { FileChanges, UsageResponse } from './common/actions';
import { type CostMode } from './common/constants';
import { FileVersion, ProjectFileContext } from './common/util/file';
import { GitCommand } from './types';
export declare class Client {
    private webSocket;
    private chatStorage;
    private currentUserInputId;
    private returnControlToUser;
    private fingerprintId;
    private costMode;
    fileVersions: FileVersion[][];
    fileContext: ProjectFileContext | undefined;
    user: User | undefined;
    lastWarnedPct: number;
    usage: number;
    limit: number;
    subscription_active: boolean;
    lastRequestCredits: number;
    sessionCreditsUsed: number;
    nextQuotaReset: Date | null;
    private git;
    constructor(websocketUrl: string, chatStorage: ChatStorage, onWebSocketError: () => void, onWebSocketReconnect: () => void, returnControlToUser: () => void, costMode: CostMode, git: GitCommand);
    initFileVersions(projectFileContext: ProjectFileContext): void;
    private getFingerprintId;
    private getUser;
    connect(): Promise<void>;
    handleReferralCode(referralCode: string): Promise<void>;
    logout(): Promise<void>;
    login(referralCode?: string): Promise<void>;
    setUsage({ usage, limit, subscription_active, next_quota_reset, referralLink, session_credits_used, }: Omit<UsageResponse, 'type'>): void;
    private setupSubscriptions;
    showUsageWarning(referralLink?: string): void;
    generateCommitMessage(stagedChanges: string): Promise<string>;
    sendUserInput(previousChanges: FileChanges, userInputId: string): Promise<void>;
    subscribeToResponse(onChunk: (chunk: string) => void, userInputId: string, onStreamStart: () => void): {
        responsePromise: Promise<{
            type: "response-complete";
            userInputId: string;
            changesAlreadyApplied: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            response: string;
            changes: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            addedFileVersions: {
                path: string;
                content: string;
            }[];
            resetFileVersions: boolean;
            usage?: number | undefined;
            limit?: number | undefined;
            referralLink?: string | undefined;
            subscription_active?: boolean | undefined;
            next_quota_reset?: Date | undefined;
            session_credits_used?: number | undefined;
        } & {
            type: "response-complete";
        } & {
            wasStoppedByUser: boolean;
        }>;
        stopResponse: () => void;
    };
    getUsage(): Promise<void>;
    warmContextCache(): Promise<void>;
}
