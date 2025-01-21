"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMaxedReferrals = hasMaxedReferrals;
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../../db/schema"));
const db_1 = __importDefault(require("../../db"));
const referral_1 = require("../referral");
const env_mjs_1 = require("../../env.mjs");
async function hasMaxedReferrals(userId) {
    try {
        const referralCount = await db_1.default
            .select({
            count: (0, drizzle_orm_1.sql) `count(*)`,
        })
            .from(schema.referral)
            .where((0, drizzle_orm_1.eq)(schema.referral.referrer_id, userId))
            .then((result) => (result.length > 0 ? result[0].count : 0));
        const user = await db_1.default.query.user.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.user.id, userId),
            columns: {
                referral_code: true,
                referral_limit: true,
            },
        });
        if (!user || !user.referral_code) {
            return {
                reason: 'Referrer Not Found',
                details: {
                    referralCount,
                    msg: `This referrer isn't registered with us. Please try again and reach out to ${env_mjs_1.env.NEXT_PUBLIC_SUPPORT_EMAIL} if the problem
          persists.`,
                },
            };
        }
        if (referralCount >= user.referral_limit) {
            return {
                reason: 'Referral Limit Reached',
                details: {
                    referralCount,
                    msg: 'This referrer has maxxed out the number of referrals they can make',
                },
            };
        }
        return {
            reason: undefined,
            referralLink: (0, referral_1.getReferralLink)(user.referral_code),
            details: { referralCount },
        };
    }
    catch (error) {
        return {
            reason: 'Unknown Error',
            details: {
                msg: error instanceof Error ? error.message : String(error),
            },
        };
    }
}
//# sourceMappingURL=referral.js.map