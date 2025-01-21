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
exports.WebhookProcessor = void 0;
const stripe_1 = require("../util/stripe");
const db_1 = __importDefault(require("../db"));
const schema = __importStar(require("../db/schema"));
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const subscription_state_1 = require("./subscription-state");
const quota_manager_1 = require("./quota-manager");
const payment_guards_1 = require("./payment-guards");
const webhookEventSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.string(),
    created: zod_1.z.number(),
    data: zod_1.z.object({
        object: zod_1.z.record(zod_1.z.any()),
    }),
});
class WebhookProcessor {
    stripeSignature;
    rawBody;
    constructor(stripeSignature, rawBody) {
        this.stripeSignature = stripeSignature;
        this.rawBody = rawBody;
    }
    async validateWebhook() {
        try {
            const event = stripe_1.stripeServer.webhooks.constructEvent(this.rawBody, this.stripeSignature, process.env.STRIPE_WEBHOOK_SECRET_KEY);
            // Validate event structure
            const result = webhookEventSchema.safeParse(event);
            if (!result.success) {
                return {
                    valid: false,
                    error: 'Invalid event structure',
                };
            }
            // Check for duplicate events
            const isDuplicate = await this.checkDuplicateEvent(event.id);
            if (isDuplicate) {
                return {
                    valid: false,
                    error: 'Duplicate event',
                };
            }
            return {
                valid: true,
                event,
            };
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async checkDuplicateEvent(eventId) {
        // First try to insert the event
        try {
            await db_1.default.insert(schema.webhook_events).values({
                id: eventId,
                processed_at: new Date(),
            });
            return false; // Not a duplicate
        }
        catch (error) {
            // If insert fails due to unique constraint, it's a duplicate
            return true;
        }
    }
    async processEvent(event) {
        // Start transaction to ensure atomic processing
        await db_1.default.transaction(async (tx) => {
            // Lock the subscription record if this is a subscription-related event
            if (event.type.startsWith('customer.subscription.')) {
                const subscription = event.data.object;
                await tx
                    .select()
                    .from(schema.user)
                    .where((0, drizzle_orm_1.eq)(schema.user.stripe_price_id, subscription.id))
                    .for('update');
            }
            // Record event processing start
            await tx.insert(schema.webhook_processing).values({
                id: crypto.randomUUID(),
                event_id: event.id,
                started_at: new Date(),
                status: 'processing',
            });
            try {
                // Process the event based on type
                await this.handleEvent(event);
                // Record successful processing
                await tx
                    .update(schema.webhook_processing)
                    .set({
                    status: 'completed',
                    completed_at: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema.webhook_processing.event_id, event.id));
            }
            catch (error) {
                // Record failed processing
                await tx
                    .update(schema.webhook_processing)
                    .set({
                    status: 'failed',
                    error_message: error instanceof Error ? error.message : 'Unknown error',
                    completed_at: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema.webhook_processing.event_id, event.id));
                throw error; // Re-throw to rollback transaction
            }
        });
    }
    async handleEvent(event) {
        // Check for older unprocessed events
        const pendingEvents = await db_1.default
            .select({
            id: schema.webhook_events.id,
            created: schema.webhook_events.created_at,
        })
            .from(schema.webhook_events)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `created_at < ${new Date(event.created * 1000)}`, (0, drizzle_orm_1.eq)(schema.webhook_events.processed, false)))
            .orderBy(schema.webhook_events.created_at);
        // If there are older unprocessed events, delay processing this one
        if (pendingEvents.length > 0) {
            throw new Error(`Unprocessed events exist before ${event.id}. Process those first.`);
        }
        // Process based on event type
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await this.handleSubscriptionChange(event);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeletion(event);
                break;
            case 'invoice.created':
                await this.handleInvoiceCreation(event);
                break;
            case 'invoice.paid':
                await this.handleInvoicePayment(event);
                break;
            case 'invoice.payment_failed':
                await this.handlePaymentFailure(event);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        // Mark event as processed
        await db_1.default
            .update(schema.webhook_events)
            .set({
            processed: true,
            processed_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema.webhook_events.id, event.id));
    }
    async handleSubscriptionChange(event) {
        const subscription = event.data.object;
        const stateManager = new subscription_state_1.SubscriptionStateManager(subscription.id);
        const quotaManager = new quota_manager_1.QuotaManager(subscription.id);
        // Get the current state and update it
        const currentState = await stateManager.getCurrentState();
        const newState = this.mapStripeStatus(subscription.status);
        if (currentState !== newState) {
            // Acquire lock for state transition
            const lockAcquired = await stateManager.beginStateTransition();
            if (!lockAcquired) {
                throw new Error('Failed to acquire transition lock');
            }
            try {
                // Record state change
                await stateManager.addStateHistoryEntry(currentState, newState, `Webhook event: ${event.type}`);
                // Handle quota updates if needed
                if (newState === 'active' && currentState !== 'active') {
                    await quotaManager.resetQuota();
                }
            }
            finally {
                await stateManager.endStateTransition();
            }
        }
    }
    async handleSubscriptionDeletion(event) {
        const subscription = event.data.object;
        const stateManager = new subscription_state_1.SubscriptionStateManager(subscription.id);
        const lockAcquired = await stateManager.beginStateTransition();
        if (!lockAcquired) {
            throw new Error('Failed to acquire transition lock');
        }
        try {
            await stateManager.addStateHistoryEntry('active', 'canceled', 'Subscription deleted');
        }
        finally {
            await stateManager.endStateTransition();
        }
    }
    async handleInvoiceCreation(event) {
        const invoice = event.data.object;
        if (!invoice.subscription)
            return;
        // Handle referral credits if applicable
        if (invoice.customer) {
            const referralCredits = await this.getTotalReferralCredits(invoice.customer.toString());
            if (referralCredits > 0) {
                // Apply referral credits as credit on the invoice
                await stripe_1.stripeServer.invoices.update(invoice.id, {
                    description: `Including referral credits: ${referralCredits}`,
                });
            }
        }
    }
    async handleInvoicePayment(event) {
        const invoice = event.data.object;
        if (!invoice.subscription)
            return;
        const stateManager = new subscription_state_1.SubscriptionStateManager(invoice.subscription.toString());
        const quotaManager = new quota_manager_1.QuotaManager(invoice.subscription.toString());
        // Reset quota for new billing period
        await quotaManager.resetQuota();
        // Update subscription state if needed
        const currentState = await stateManager.getCurrentState();
        if (currentState !== 'active') {
            const lockAcquired = await stateManager.beginStateTransition();
            if (!lockAcquired) {
                throw new Error('Failed to acquire transition lock');
            }
            try {
                await stateManager.addStateHistoryEntry(currentState, 'active', 'Invoice payment successful');
            }
            finally {
                await stateManager.endStateTransition();
            }
        }
    }
    async handlePaymentFailure(event) {
        const invoice = event.data.object;
        if (!invoice.subscription)
            return;
        const paymentGuards = new payment_guards_1.PaymentGuards(invoice.subscription.toString());
        await paymentGuards.handleFailedPayment();
        // Update subscription state
        const stateManager = new subscription_state_1.SubscriptionStateManager(invoice.subscription.toString());
        const lockAcquired = await stateManager.beginStateTransition();
        if (!lockAcquired) {
            throw new Error('Failed to acquire transition lock');
        }
        try {
            await stateManager.addStateHistoryEntry('active', 'past_due', 'Payment failed');
        }
        finally {
            await stateManager.endStateTransition();
        }
    }
    async getTotalReferralCredits(customerId) {
        const result = await db_1.default
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema.referral.credits}), 0)::int`,
        })
            .from(schema.user)
            .leftJoin(schema.referral, (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema.referral.referrer_id, schema.user.id), (0, drizzle_orm_1.eq)(schema.referral.referred_id, schema.user.id)))
            .where((0, drizzle_orm_1.eq)(schema.user.stripe_customer_id, customerId))
            .groupBy(schema.user.id);
        return result[0]?.total || 0;
    }
    mapStripeStatus(status) {
        switch (status) {
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
                throw new Error(`Unknown Stripe status: ${status}`);
        }
    }
}
exports.WebhookProcessor = WebhookProcessor;
//# sourceMappingURL=webhook-processor.js.map