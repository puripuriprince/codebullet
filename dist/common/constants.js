"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_USER_ID = exports.models = exports.deepseekModels = exports.geminiModels = exports.openaiModels = exports.claudeModels = exports.getModelForMode = exports.costModes = exports.CREDITS_USAGE_LIMITS = exports.PLAN_CONFIGS = exports.UsageLimits = exports.getUsageLimitFromPlanName = exports.getPlanDisplayName = exports.CREDITS_REFERRAL_BONUS = exports.OVERAGE_RATE_MOAR_PRO = exports.OVERAGE_RATE_PRO = exports.BILLING_PERIOD_DAYS = exports.MAX_DATE = exports.REQUEST_CREDIT_SHOW_THRESHOLD = exports.SKIPPED_TERMINAL_COMMANDS = exports.DEFAULT_IGNORED_FILES = exports.EXISTING_CODE_MARKER = exports.TOOL_RESULT_MARKER = exports.FIND_FILES_MARKER = exports.STOP_MARKER = void 0;
exports.STOP_MARKER = '[' + 'END]';
exports.FIND_FILES_MARKER = '[' + 'FIND_FILES_PLEASE]';
exports.TOOL_RESULT_MARKER = '[' + 'TOOL_RESULT]';
exports.EXISTING_CODE_MARKER = '[[**REPLACE_WITH_EXISTING_CODE**]]';
exports.DEFAULT_IGNORED_FILES = [
    '.git',
    '.env',
    '.env.*',
    'env',
    'ENV',
    '*.min.*',
    'node_modules',
    'venv',
    'virtualenv',
    '.venv',
    '.virtualenv',
    '__pycache__',
    '*.egg-info/',
    '*.pyc',
    '.DS_Store',
    '.pytest_cache',
    '.mypy_cache',
    '.ruff_cache',
    '.next',
    'package-lock.json',
    'bun.lockb',
];
exports.SKIPPED_TERMINAL_COMMANDS = [
    'continue',
    'date',
    'head',
    'history',
    'if',
    'jobs',
    'less',
    'man',
    'more',
    'nice',
    'read',
    'set',
    'sort',
    'split',
    'tail',
    'test',
    'time',
    'top',
    'touch',
    'type',
    'unset',
    'what',
    'which',
    'where',
    'who',
    'write',
    'yes',
    'help',
    'find',
    'add',
    'hey',
    'diff',
    'make',
    'please',
    'apply',
    'look',
    'do',
    'break',
    'install',
    'print',
];
exports.REQUEST_CREDIT_SHOW_THRESHOLD = 1;
exports.MAX_DATE = new Date(86399999999999);
exports.BILLING_PERIOD_DAYS = 30;
exports.OVERAGE_RATE_PRO = 0.99;
exports.OVERAGE_RATE_MOAR_PRO = 0.9;
exports.CREDITS_REFERRAL_BONUS = 500;
// Helper to convert from UsageLimits to display names
const getPlanDisplayName = (limit) => {
    return exports.PLAN_CONFIGS[limit].displayName;
};
exports.getPlanDisplayName = getPlanDisplayName;
// Helper to convert from display name to UsageLimits
const getUsageLimitFromPlanName = (planName) => {
    const entry = Object.entries(exports.PLAN_CONFIGS).find(([_, config]) => config.planName === planName);
    if (!entry) {
        throw new Error(`Invalid plan name: ${planName}`);
    }
    return entry[0];
};
exports.getUsageLimitFromPlanName = getUsageLimitFromPlanName;
exports.UsageLimits = {
    ANON: 'ANON',
    FREE: 'FREE',
    PRO: 'PRO',
    MOAR_PRO: 'MOAR_PRO',
};
// Define base configs with production values
exports.PLAN_CONFIGS = {
    ANON: {
        limit: 250,
        planName: exports.UsageLimits.ANON,
        displayName: 'Anonymous',
        monthlyPrice: 0,
        overageRate: null,
    },
    FREE: {
        limit: 1_000,
        planName: exports.UsageLimits.FREE,
        displayName: 'Free',
        monthlyPrice: 0,
        overageRate: null,
    },
    PRO: {
        limit: 5_000,
        planName: exports.UsageLimits.PRO,
        displayName: 'Pro',
        monthlyPrice: 49,
        overageRate: exports.OVERAGE_RATE_PRO,
    },
    MOAR_PRO: {
        limit: 27_500,
        planName: exports.UsageLimits.MOAR_PRO,
        displayName: 'Pro Plus',
        monthlyPrice: 249,
        overageRate: exports.OVERAGE_RATE_MOAR_PRO,
    },
};
// Increase limits by 1000 in local environment to make testing easier
if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'local') {
    Object.values(exports.PLAN_CONFIGS).forEach((config) => {
        config.limit *= 1000;
    });
}
// Helper to get credits limit from a plan config
exports.CREDITS_USAGE_LIMITS = Object.fromEntries(Object.entries(exports.PLAN_CONFIGS).map(([key, config]) => [key, config.limit]));
exports.costModes = ['lite', 'normal', 'max'];
const getModelForMode = (costMode, operation) => {
    if (operation === 'agent') {
        return costMode === 'lite' ? exports.claudeModels.haiku : exports.claudeModels.sonnet;
    }
    if (operation === 'file-requests') {
        return costMode === 'max' ? exports.claudeModels.sonnet : exports.claudeModels.haiku;
    }
    if (operation === 'check-new-files') {
        return costMode === 'lite' ? exports.models.gpt4omini : exports.models.gpt4o;
    }
    throw new Error(`Unknown operation: ${operation}`);
};
exports.getModelForMode = getModelForMode;
exports.claudeModels = {
    sonnet: 'claude-3-5-sonnet-20241022',
    haiku: 'claude-3-5-haiku-20241022',
};
exports.openaiModels = {
    gpt4o: 'gpt-4o-2024-08-06',
    gpt4omini: 'gpt-4o-mini-2024-07-18',
    o1: 'o1',
    // o1: 'o1-2024-12-17',
};
exports.geminiModels = {
    gemini2flash: 'gemini-2.0-flash-exp',
};
exports.deepseekModels = {
    deepseekChat: 'deepseek-chat',
};
exports.models = {
    ...exports.claudeModels,
    ...exports.openaiModels,
    ...exports.geminiModels,
    ...exports.deepseekModels,
};
exports.TEST_USER_ID = 'test-user-id';
//# sourceMappingURL=constants.js.map