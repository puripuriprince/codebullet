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
exports.PaymentGuards = void 0;
const stripe_1 = require("../util/stripe");
const db_1 = __importDefault(require("../db"));
const schema = __importStar(require("../db/schema"));
const drizzle_orm_1 = require("drizzle-orm");
class PaymentGuards {
    subscriptionId;
    constructor(subscriptionId) {
        this.subscriptionId = subscriptionId;
    }
    async validatePaymentMethod() {
        try {
            const subscription = await stripe_1.stripeServer.subscriptions.retrieve(this.subscriptionId, {
                expand: ['latest_invoice.payment_intent'],
            });
            const invoice = subscription.latest_invoice;
            if (!invoice?.payment_intent) {
                return { valid: true }; // No payment needed
            }
            const paymentIntent = invoice.payment_intent;
            if (paymentIntent.status === 'succeeded') {
                return { valid: true };
            }
            return {
                valid: false,
                error: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
            };
        }
        catch (error) {
            console.error('Error validating payment method:', error);
            return {
                valid: false,
                error: 'Failed to validate payment method',
            };
        }
    }
    async handleFailedPayment() {
        // Record the failed attempt
        await db_1.default.insert(schema.payment_attempts).values({
            id: crypto.randomUUID(),
            subscription_id: this.subscriptionId,
            status: 'failed',
            created_at: new Date(),
        });
        // Get the subscription to check retry count
        const attempts = await db_1.default
            .select({
            count: (0, drizzle_orm_1.sql) `count(*)::int`,
        })
            .from(schema.payment_attempts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.payment_attempts.subscription_id, this.subscriptionId), (0, drizzle_orm_1.eq)(schema.payment_attempts.status, 'failed'), (0, drizzle_orm_1.sql) `created_at > now() - interval '24 hours'`));
        const retryCount = attempts[0].count;
        if (retryCount >= 3) {
            // Too many failures, pause the subscription
            await stripe_1.stripeServer.subscriptions.update(this.subscriptionId, {
                pause_collection: {
                    behavior: 'void',
                },
            });
        }
    }
    async processPartialPayment(amountPaid) {
        // Record the partial payment
        await db_1.default.insert(schema.payment_attempts).values({
            id: crypto.randomUUID(),
            subscription_id: this.subscriptionId,
            amount: amountPaid.toString(), // Convert to string for decimal type
            status: 'partial',
            created_at: new Date(),
        });
        // Update the subscription with remaining balance
        const subscription = await stripe_1.stripeServer.subscriptions.retrieve(this.subscriptionId, {
            expand: ['latest_invoice'],
        });
        const invoice = subscription.latest_invoice;
        if (invoice) {
            const remainingAmount = invoice.amount_due - amountPaid;
            if (remainingAmount > 0) {
                await stripe_1.stripeServer.invoices.update(invoice.id, {
                    description: `Partial payment received: ${amountPaid}. Remaining: ${remainingAmount}`,
                });
            }
        }
    }
    async handleRefund(amount) {
        const subscription = await stripe_1.stripeServer.subscriptions.retrieve(this.subscriptionId, {
            expand: ['latest_invoice.payment_intent'],
        });
        const invoice = subscription.latest_invoice;
        if (!invoice?.payment_intent) {
            throw new Error('No payment found to refund');
        }
        await stripe_1.stripeServer.refunds.create({
            payment_intent: invoice.payment_intent.id,
            amount,
        });
        // Record the refund
        await db_1.default.insert(schema.payment_attempts).values({
            id: crypto.randomUUID(),
            subscription_id: this.subscriptionId,
            amount: (-amount).toString(), // Convert to string for decimal type
            status: 'refunded',
            created_at: new Date(),
        });
    }
}
exports.PaymentGuards = PaymentGuards;
//# sourceMappingURL=payment-guards.js.map