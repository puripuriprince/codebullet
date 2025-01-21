"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_ACTION_SCHEMA = exports.ResponseCompleteSchema = exports.InitResponseSchema = exports.UsageReponseSchema = exports.CLIENT_ACTION_SCHEMA = exports.ToolCallSchema = exports.CHANGES = exports.FileChangeSchema = void 0;
const zod_1 = require("zod");
const file_1 = require("./util/file");
const credentials_1 = require("./util/credentials");
const constants_1 = require("./constants");
const MessageContentObjectSchema = zod_1.z.union([
    zod_1.z.object({
        type: zod_1.z.literal('text'),
        text: zod_1.z.string(),
        cache_control: zod_1.z
            .object({
            type: zod_1.z.literal('ephemeral'),
        })
            .optional(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('tool_use'),
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        input: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
        cache_control: zod_1.z
            .object({
            type: zod_1.z.literal('ephemeral'),
        })
            .optional(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('tool_result'),
        tool_use_id: zod_1.z.string(),
        content: zod_1.z.string(),
        cache_control: zod_1.z
            .object({
            type: zod_1.z.literal('ephemeral'),
        })
            .optional(),
    }),
]);
const MessageSchema = zod_1.z.object({
    role: zod_1.z.union([zod_1.z.literal('user'), zod_1.z.literal('assistant')]),
    content: zod_1.z.union([zod_1.z.string(), zod_1.z.array(MessageContentObjectSchema)]),
});
exports.FileChangeSchema = zod_1.z.object({
    type: zod_1.z.enum(['patch', 'file']),
    filePath: zod_1.z.string(),
    content: zod_1.z.string(),
});
exports.CHANGES = zod_1.z.array(exports.FileChangeSchema);
exports.ToolCallSchema = zod_1.z.object({
    name: zod_1.z.string(),
    id: zod_1.z.string(),
    input: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
});
exports.CLIENT_ACTION_SCHEMA = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({
        type: zod_1.z.literal('user-input'),
        fingerprintId: zod_1.z.string(),
        authToken: zod_1.z.string().optional(),
        userInputId: zod_1.z.string(),
        messages: zod_1.z.array(MessageSchema),
        fileContext: file_1.ProjectFileContextSchema,
        changesAlreadyApplied: exports.CHANGES,
        costMode: zod_1.z.enum(constants_1.costModes).optional().default('normal'),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('read-files-response'),
        files: zod_1.z.record(zod_1.z.string(), zod_1.z.union([zod_1.z.string(), zod_1.z.null()])),
    }),
    // z.object({
    //   type: z.literal('run-terminal-command'),
    //   command: z.string(),
    // }),
    zod_1.z.object({
        type: zod_1.z.literal('init'),
        fingerprintId: zod_1.z.string(),
        authToken: zod_1.z.string().optional(),
        // userId: z.string().optional(),
        fileContext: file_1.ProjectFileContextSchema,
    }),
    zod_1.z.object({
        type: zod_1.z.literal('usage'),
        fingerprintId: zod_1.z.string(),
        authToken: zod_1.z.string().optional(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('login-code-request'),
        fingerprintId: zod_1.z.string(),
        referralCode: zod_1.z.string().optional(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('login-status-request'),
        fingerprintId: zod_1.z.string(),
        fingerprintHash: zod_1.z.string(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('clear-auth-token'),
        authToken: zod_1.z.string(),
        fingerprintId: zod_1.z.string(),
        userId: zod_1.z.string(),
        // authToken: z.string().optional(),
        fingerprintHash: zod_1.z.string(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('generate-commit-message'),
        fingerprintId: zod_1.z.string(),
        authToken: zod_1.z.string().optional(),
        stagedChanges: zod_1.z.string(),
    }),
]);
exports.UsageReponseSchema = zod_1.z.object({
    type: zod_1.z.literal('usage-response'),
    usage: zod_1.z.number(),
    limit: zod_1.z.number(),
    referralLink: zod_1.z.string().optional(),
    subscription_active: zod_1.z.boolean(),
    next_quota_reset: zod_1.z.coerce.date(),
    session_credits_used: zod_1.z.number(),
});
exports.InitResponseSchema = zod_1.z
    .object({
    type: zod_1.z.literal('init-response'),
})
    .merge(exports.UsageReponseSchema.omit({
    type: true,
}));
exports.ResponseCompleteSchema = zod_1.z
    .object({
    type: zod_1.z.literal('response-complete'),
    userInputId: zod_1.z.string(),
    response: zod_1.z.string(),
    changes: exports.CHANGES,
    changesAlreadyApplied: exports.CHANGES,
    addedFileVersions: zod_1.z.array(file_1.FileVersionSchema),
    resetFileVersions: zod_1.z.boolean(),
})
    .merge(exports.UsageReponseSchema.omit({
    type: true,
}).partial());
exports.SERVER_ACTION_SCHEMA = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({
        type: zod_1.z.literal('response-chunk'),
        userInputId: zod_1.z.string(),
        chunk: zod_1.z.string(),
    }),
    exports.ResponseCompleteSchema,
    zod_1.z.object({
        type: zod_1.z.literal('read-files'),
        filePaths: zod_1.z.array(zod_1.z.string()),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('tool-call'),
        userInputId: zod_1.z.string(),
        response: zod_1.z.string(),
        data: exports.ToolCallSchema,
        changes: exports.CHANGES,
        changesAlreadyApplied: exports.CHANGES,
        addedFileVersions: zod_1.z.array(file_1.FileVersionSchema),
        resetFileVersions: zod_1.z.boolean(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('terminal-command-result'),
        userInputId: zod_1.z.string(),
        result: zod_1.z.string(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('npm-version-status'),
        isUpToDate: zod_1.z.boolean(),
        latestVersion: zod_1.z.string(),
    }),
    exports.InitResponseSchema,
    zod_1.z.object({
        type: zod_1.z.literal('auth-result'),
        user: credentials_1.userSchema.optional(),
        message: zod_1.z.string(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('login-code-response'),
        fingerprintId: zod_1.z.string(),
        fingerprintHash: zod_1.z.string(),
        loginUrl: zod_1.z.string().url(),
    }),
    exports.UsageReponseSchema,
    zod_1.z.object({
        type: zod_1.z.literal('action-error'),
        message: zod_1.z.string(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('commit-message-response'),
        commitMessage: zod_1.z.string(),
    }),
]);
//# sourceMappingURL=actions.js.map