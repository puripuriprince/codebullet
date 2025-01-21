import { z } from 'zod';
export declare const usageDataSchema: z.ZodObject<{
    creditsUsed: z.ZodNumber;
    totalQuota: z.ZodNumber;
    remainingCredits: z.ZodNumber;
    subscriptionActive: z.ZodBoolean;
    nextQuotaReset: z.ZodDate;
    overageRate: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    creditsUsed: number;
    overageRate: number | null;
    totalQuota: number;
    remainingCredits: number;
    subscriptionActive: boolean;
    nextQuotaReset: Date;
}, {
    creditsUsed: number;
    overageRate: number | null;
    totalQuota: number;
    remainingCredits: number;
    subscriptionActive: boolean;
    nextQuotaReset: Date;
}>;
export type UsageData = z.infer<typeof usageDataSchema>;
