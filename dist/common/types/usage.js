"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usageDataSchema = void 0;
const zod_1 = require("zod");
exports.usageDataSchema = zod_1.z.object({
    creditsUsed: zod_1.z.number(),
    totalQuota: zod_1.z.number(),
    remainingCredits: zod_1.z.number(),
    subscriptionActive: zod_1.z.boolean(),
    nextQuotaReset: zod_1.z.coerce.date(),
    overageRate: zod_1.z.number().nullable(),
});
//# sourceMappingURL=usage.js.map