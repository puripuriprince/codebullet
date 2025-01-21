export declare const STOP_MARKER: string;
export declare const FIND_FILES_MARKER: string;
export declare const TOOL_RESULT_MARKER: string;
export declare const EXISTING_CODE_MARKER = "[[**REPLACE_WITH_EXISTING_CODE**]]";
export declare const DEFAULT_IGNORED_FILES: string[];
export declare const SKIPPED_TERMINAL_COMMANDS: string[];
export declare const REQUEST_CREDIT_SHOW_THRESHOLD = 1;
export declare const MAX_DATE: Date;
export declare const BILLING_PERIOD_DAYS = 30;
export declare const OVERAGE_RATE_PRO = 0.99;
export declare const OVERAGE_RATE_MOAR_PRO = 0.9;
export declare const CREDITS_REFERRAL_BONUS = 500;
export declare const getPlanDisplayName: (limit: UsageLimits) => string;
export declare const getUsageLimitFromPlanName: (planName: string) => UsageLimits;
export type PlanConfig = {
    limit: number;
    planName: UsageLimits;
    displayName: string;
    monthlyPrice: number;
    overageRate: number | null;
};
export declare const UsageLimits: {
    readonly ANON: "ANON";
    readonly FREE: "FREE";
    readonly PRO: "PRO";
    readonly MOAR_PRO: "MOAR_PRO";
};
export type UsageLimits = (typeof UsageLimits)[keyof typeof UsageLimits];
export declare const PLAN_CONFIGS: Record<UsageLimits, PlanConfig>;
export declare const CREDITS_USAGE_LIMITS: Record<UsageLimits, number>;
export declare const costModes: readonly ["lite", "normal", "max"];
export type CostMode = (typeof costModes)[number];
export declare const getModelForMode: (costMode: CostMode, operation: "agent" | "file-requests" | "check-new-files") => "claude-3-5-sonnet-20241022" | "claude-3-5-haiku-20241022" | "gpt-4o-2024-08-06" | "gpt-4o-mini-2024-07-18";
export declare const claudeModels: {
    readonly sonnet: "claude-3-5-sonnet-20241022";
    readonly haiku: "claude-3-5-haiku-20241022";
};
export declare const openaiModels: {
    readonly gpt4o: "gpt-4o-2024-08-06";
    readonly gpt4omini: "gpt-4o-mini-2024-07-18";
    readonly o1: "o1";
};
export declare const geminiModels: {
    readonly gemini2flash: "gemini-2.0-flash-exp";
};
export declare const deepseekModels: {
    readonly deepseekChat: "deepseek-chat";
};
export declare const models: {
    readonly deepseekChat: "deepseek-chat";
    readonly gemini2flash: "gemini-2.0-flash-exp";
    readonly gpt4o: "gpt-4o-2024-08-06";
    readonly gpt4omini: "gpt-4o-mini-2024-07-18";
    readonly o1: "o1";
    readonly sonnet: "claude-3-5-sonnet-20241022";
    readonly haiku: "claude-3-5-haiku-20241022";
};
export declare const TEST_USER_ID = "test-user-id";
