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
exports.SubscriptionStateManager = exports.subscriptionStateSchema = void 0;
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../db"));
const schema = __importStar(require("../db/schema"));
const stripe_1 = require("../util/stripe");
exports.subscriptionStateSchema = zod_1.z.enum([
    'active',
    'past_due',
    'incomplete',
    'canceled',
    'trialing',
    'paused',
    'transitioning',
]);
class SubscriptionStateManager {
    subscriptionId;
    transitionLock = null;
    constructor(subscriptionId) {
        this.subscriptionId = subscriptionId;
    }
    async getCurrentState() {
        const subscription = await stripe_1.stripeServer.subscriptions.retrieve(this.subscriptionId);
        return this.mapStripeState(subscription.status);
    }
    async beginStateTransition() {
        // Generate a new lock UUID
        const newLock = crypto.randomUUID();
        // Try to acquire lock
        const result = await db_1.default
            .update(schema.user)
            .set({
            transition_lock: newLock,
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.user.stripe_price_id, this.subscriptionId), (0, drizzle_orm_1.sql) `transition_lock IS NULL`))
            .returning({ transitionLock: schema.user.transition_lock });
        if (result.length === 0) {
            return false; // Lock acquisition failed
        }
        this.transitionLock = newLock;
        return true;
    }
    async endStateTransition() {
        if (!this.transitionLock) {
            throw new Error('No active transition');
        }
        await db_1.default
            .update(schema.user)
            .set({
            transition_lock: null,
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.user.stripe_price_id, this.subscriptionId), (0, drizzle_orm_1.eq)(schema.user.transition_lock, this.transitionLock)));
        this.transitionLock = null;
    }
    async addStateHistoryEntry(fromState, toState, reason) {
        const entry = {
            fromState,
            toState,
            reason,
            timestamp: new Date().toISOString(),
        };
        await db_1.default
            .update(schema.user)
            .set({
            state_history: (0, drizzle_orm_1.sql) `COALESCE(state_history, '[]'::jsonb) || ${JSON.stringify(entry)}::jsonb`,
        })
            .where((0, drizzle_orm_1.eq)(schema.user.stripe_price_id, this.subscriptionId));
    }
    mapStripeState(stripeStatus) {
        switch (stripeStatus) {
            case 'active':
                return 'active';
            case 'past_due':
                return 'past_due';
            case 'incomplete':
                return 'incomplete';
            case 'canceled':
                return 'canceled';
            case 'trialing':
                return 'trialing';
            case 'paused':
                return 'paused';
            default:
                throw new Error(`Unknown Stripe status: ${stripeStatus}`);
        }
    }
}
exports.SubscriptionStateManager = SubscriptionStateManager;
//# sourceMappingURL=subscription-state.js.map