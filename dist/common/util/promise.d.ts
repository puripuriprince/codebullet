export declare const INITIAL_RETRY_DELAY = 1000;
export declare function withRetry<T>(operation: () => Promise<T>, options?: {
    maxRetries?: number;
    shouldRetry?: (error: any) => boolean;
    onRetry?: (error: any, attempt: number) => void;
    retryDelayMs?: number;
}): Promise<T>;
export declare const mapAsync: <T, U>(items: T[], f: (item: T, index: number) => Promise<U>, maxConcurrentRequests?: number) => Promise<U[]>;
export declare const sleep: (ms: number) => Promise<unknown>;
