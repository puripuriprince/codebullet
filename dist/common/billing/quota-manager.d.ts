type CheckQuotaResult = Promise<{
    creditsUsed: number;
    quota: number;
    endDate: Date;
    subscription_active: boolean;
    session_credits_used?: number;
}>;
export interface IQuotaManager {
    checkQuota(id: string): CheckQuotaResult;
    setNextQuota(id: string, quota_exceeded: boolean, next_quota_reset: Date): Promise<void>;
}
export declare class AnonymousQuotaManager implements IQuotaManager {
    checkQuota(fingerprintId: string, sessionId?: string): CheckQuotaResult;
    setNextQuota(fingerprintId: string, quota_exceeded: boolean, next_quota_reset: Date): Promise<void>;
}
export declare class AuthenticatedQuotaManager implements IQuotaManager {
    getStripeSubscriptionQuota(userId: string): Promise<{
        quota: number;
        overageRate: number | null;
    }>;
    checkQuota(userId: string, sessionId?: string): CheckQuotaResult;
    setNextQuota(userId: string, quota_exceeded: boolean, next_quota_reset: Date): Promise<void>;
}
export type AuthType = 'anonymous' | 'authenticated';
export declare const getQuotaManager: (authType: AuthType, id: string) => {
    checkQuota: (sessionId?: string) => CheckQuotaResult;
    setNextQuota: (quota_exceeded: boolean, next_quota_reset: Date) => Promise<void>;
};
export {};
