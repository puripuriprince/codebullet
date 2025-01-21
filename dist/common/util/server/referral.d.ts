export type ReferralStatus = {
    reason: 'Referral Limit Reached' | 'Referrer Not Found' | 'Unknown Error';
    details?: {
        referralCount?: number;
        msg: string;
    };
} | {
    reason: undefined;
    referralLink: string;
    details: {
        referralCount: number;
    };
};
export declare function hasMaxedReferrals(userId: string): Promise<ReferralStatus>;
