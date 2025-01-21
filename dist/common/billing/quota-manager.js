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
exports.getQuotaManager = exports.AuthenticatedQuotaManager = exports.AnonymousQuotaManager = void 0;
const stripe_1 = require("../util/stripe");
const constants_1 = require("../constants");
const db_1 = __importDefault(require("../db"));
const schema = __importStar(require("../db/schema"));
const drizzle_orm_1 = require("drizzle-orm");
const ts_pattern_1 = require("ts-pattern");
class AnonymousQuotaManager {
    async checkQuota(fingerprintId, sessionId) {
        const quota = constants_1.CREDITS_USAGE_LIMITS.ANON;
        const startDate = (0, drizzle_orm_1.sql) `COALESCE(${schema.fingerprint.next_quota_reset}, now()) - INTERVAL '1 month'`;
        const endDate = (0, drizzle_orm_1.sql) `COALESCE(${schema.fingerprint.next_quota_reset}, now())`;
        let session_credits_used = undefined;
        const result = await db_1.default
            .select({
            creditsUsed: (0, drizzle_orm_1.sql) `SUM(COALESCE(${schema.message.credits}, 0))`,
            endDate,
        })
            .from(schema.fingerprint)
            .leftJoin(schema.message, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.message.fingerprint_id, fingerprintId), (0, drizzle_orm_1.between)(schema.message.finished_at, startDate, endDate)))
            .where((0, drizzle_orm_1.eq)(schema.fingerprint.id, fingerprintId))
            .groupBy(schema.fingerprint.next_quota_reset)
            .then((rows) => {
            if (rows.length > 0)
                return rows[0];
            return {
                creditsUsed: '0',
                endDate: new Date().toDateString(),
            };
        });
        if (sessionId) {
            session_credits_used = await db_1.default
                .select({
                client_id: schema.message.client_id,
                fingerprint_id: schema.message.fingerprint_id,
                sessionCreditsUsed: (0, drizzle_orm_1.sql) `SUM(COALESCE(${schema.message.credits}, 0))`,
            })
                .from(schema.message)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.message.client_id, sessionId), (0, drizzle_orm_1.eq)(schema.message.fingerprint_id, fingerprintId)))
                .groupBy(schema.message.client_id, schema.message.fingerprint_id)
                .then((rows) => {
                if (rows.length > 0) {
                    return parseInt(rows[0].sessionCreditsUsed);
                }
                return 0;
            });
        }
        return {
            creditsUsed: parseInt(result.creditsUsed),
            quota,
            endDate: new Date(result.endDate),
            subscription_active: false,
            session_credits_used,
        };
    }
    async setNextQuota(fingerprintId, quota_exceeded, next_quota_reset) {
        await db_1.default
            .update(schema.fingerprint)
            .set({
            quota_exceeded,
            next_quota_reset,
        })
            .where((0, drizzle_orm_1.eq)(schema.fingerprint.id, fingerprintId));
    }
}
exports.AnonymousQuotaManager = AnonymousQuotaManager;
class AuthenticatedQuotaManager {
    async getStripeSubscriptionQuota(userId) {
        // Get user's subscription from Stripe
        const user = await db_1.default.query.user.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.user.id, userId),
            columns: {
                stripe_customer_id: true,
                stripe_price_id: true,
            },
        });
        let overageRate = null;
        let quota = constants_1.CREDITS_USAGE_LIMITS.PRO;
        if (user?.stripe_customer_id && user?.stripe_price_id) {
            const subscriptions = await stripe_1.stripeServer.subscriptions.list({
                customer: user.stripe_customer_id,
                status: 'active',
                limit: 1,
            });
            if (subscriptions.data[0]?.id) {
                const subscription = await stripe_1.stripeServer.subscriptions.retrieve(subscriptions.data[0].id, {
                    expand: ['items.data.price.tiers'],
                });
                // Get the metered price item which contains our overage rate
                const meteredPrice = subscription.items.data.find((item) => item.price.recurring?.usage_type === 'metered');
                if (meteredPrice?.price.tiers) {
                    for (const tier of meteredPrice.price.tiers) {
                        if (tier.up_to) {
                            quota = Math.max(quota, tier.up_to);
                        }
                        if (tier.up_to === null && tier.unit_amount_decimal) {
                            overageRate = parseFloat(tier.unit_amount_decimal);
                            break;
                        }
                    }
                }
            }
        }
        return { quota, overageRate };
    }
    async checkQuota(userId, sessionId) {
        const startDate = (0, drizzle_orm_1.sql) `COALESCE(${schema.user.next_quota_reset}, now()) - INTERVAL '1 month'`;
        const endDate = (0, drizzle_orm_1.sql) `COALESCE(${schema.user.next_quota_reset}, now())`;
        let session_credits_used = undefined;
        const result = await db_1.default
            .select({
            quota: schema.user.quota,
            stripe_customer_id: schema.user.stripe_customer_id,
            stripe_price_id: schema.user.stripe_price_id,
            subscription_active: schema.user.subscription_active,
            endDate,
            creditsUsed: (0, drizzle_orm_1.sql) `SUM(COALESCE(${schema.message.credits}, 0))`,
        })
            .from(schema.user)
            .leftJoin(schema.message, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.message.user_id, schema.user.id), (0, drizzle_orm_1.between)(schema.message.finished_at, startDate, endDate)))
            .where((0, drizzle_orm_1.eq)(schema.user.id, userId))
            .groupBy(schema.user.quota, schema.user.stripe_customer_id, schema.user.stripe_price_id, schema.user.subscription_active, schema.user.next_quota_reset)
            .then((rows) => {
            if (rows.length > 0)
                return rows[0];
            return {
                quota: 0,
                stripe_customer_id: null,
                stripe_price_id: null,
                creditsUsed: '0',
                endDate: new Date().toDateString(),
                subscription_active: false,
            };
        });
        if (sessionId) {
            session_credits_used = await db_1.default
                .select({
                client_id: schema.message.client_id,
                user_id: schema.message.user_id,
                sessionCreditsUsed: (0, drizzle_orm_1.sql) `SUM(COALESCE(${schema.message.credits}, 0))`,
            })
                .from(schema.message)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.message.client_id, sessionId), (0, drizzle_orm_1.eq)(schema.message.user_id, userId)))
                .groupBy(schema.message.client_id, schema.message.user_id)
                .then((rows) => {
                if (rows.length > 0) {
                    return parseInt(rows[0].sessionCreditsUsed);
                }
                return 0;
            });
        }
        const quota = !result?.stripe_customer_id && !result?.stripe_price_id
            ? constants_1.CREDITS_USAGE_LIMITS.FREE
            : result?.quota ?? constants_1.CREDITS_USAGE_LIMITS.FREE;
        return {
            creditsUsed: parseInt(result.creditsUsed),
            quota,
            endDate: new Date(result.endDate),
            subscription_active: !!result.subscription_active,
            session_credits_used,
        };
    }
    async setNextQuota(userId, quota_exceeded, next_quota_reset) {
        await db_1.default
            .update(schema.user)
            .set({
            quota_exceeded,
            next_quota_reset,
        })
            .where((0, drizzle_orm_1.eq)(schema.user.id, userId));
    }
}
exports.AuthenticatedQuotaManager = AuthenticatedQuotaManager;
const getQuotaManager = (authType, id) => {
    const manager = (0, ts_pattern_1.match)(authType)
        .with('anonymous', () => new AnonymousQuotaManager())
        .with('authenticated', () => new AuthenticatedQuotaManager())
        .exhaustive();
    return {
        checkQuota: (sessionId) => manager.checkQuota(id, sessionId),
        setNextQuota: (quota_exceeded, next_quota_reset) => manager.setNextQuota(id, quota_exceeded, next_quota_reset),
    };
};
exports.getQuotaManager = getQuotaManager;
//# sourceMappingURL=quota-manager.js.map