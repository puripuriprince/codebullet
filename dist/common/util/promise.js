"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.mapAsync = exports.INITIAL_RETRY_DELAY = void 0;
exports.withRetry = withRetry;
exports.INITIAL_RETRY_DELAY = 1000; // 1 second
async function withRetry(operation, options = {}) {
    const { maxRetries = 3, shouldRetry = (error) => error?.type === 'APIConnectionError', onRetry = () => { }, retryDelayMs = exports.INITIAL_RETRY_DELAY } = options;
    let lastError = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (!shouldRetry(error) || attempt === maxRetries - 1) {
                throw error;
            }
            onRetry(error, attempt + 1);
            // Exponential backoff
            const delayMs = retryDelayMs * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    throw lastError;
}
const mapAsync = (items, f, maxConcurrentRequests = 20) => {
    let index = 0;
    let currRequests = 0;
    const results = [];
    return new Promise((resolve, reject) => {
        const doWork = () => {
            while (index < items.length && currRequests < maxConcurrentRequests) {
                const itemIndex = index;
                f(items[itemIndex], itemIndex)
                    .then((data) => {
                    results[itemIndex] = data;
                    currRequests--;
                    if (index === items.length && currRequests === 0)
                        resolve(results);
                    else
                        doWork();
                })
                    .catch(reject);
                index++;
                currRequests++;
            }
        };
        if (items.length === 0)
            resolve([]);
        else
            doWork();
    });
};
exports.mapAsync = mapAsync;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
exports.sleep = sleep;
//# sourceMappingURL=promise.js.map