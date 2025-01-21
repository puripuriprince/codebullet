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
const drizzle_orm_1 = require("drizzle-orm");
const stripe_1 = require("../util/stripe");
const db_1 = __importDefault(require("../db"));
const schema = __importStar(require("../db/schema"));
async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address');
        process.exit(1);
    }
    console.log(`Processing user ${email}...`);
    // Find user and verify subscription
    const user = await db_1.default.query.user.findFirst({
        where: (0, drizzle_orm_1.eq)(schema.user.email, email),
    });
    if (!user?.stripe_customer_id) {
        console.error('User not found or has no Stripe customer ID');
        process.exit(1);
    }
    console.log('Found user:', user.id);
    // Get subscriptions for customer
    const subscriptions = await stripe_1.stripeServer.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'active',
    });
    if (subscriptions.data.length === 0) {
        console.error('No active subscription found');
        process.exit(1);
    }
    const subscription = subscriptions.data[0];
    console.log('Found subscription:', subscription.id);
    // Update subscription items
    console.log('Updating subscription items...');
    await stripe_1.stripeServer.subscriptions.update(subscription.id, {
        items: [
            { price: 'price_1QLxwxKrNS6SjmqWeKhJIlAD', quantity: 1 },
            { price: 'price_1QMlqaKrNS6SjmqWQEeaTcqk' },
        ],
    });
    // Calculate usage since Oct 30, 2024
    const startDate = new Date('2024-10-30');
    const creditsUsed = await db_1.default
        .select({
        total: (0, drizzle_orm_1.sql) `SUM(${schema.message.credits})`,
    })
        .from(schema.message)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.message.user_id, user.id), (0, drizzle_orm_1.gte)(schema.message.finished_at, startDate)))
        .then((result) => parseInt(result[0]?.total ?? '0'));
    console.log('Credits used since Oct 30, 2024:', creditsUsed);
    // Report usage
    const timestamp = Math.floor(startDate.getTime() / 1000);
    await stripe_1.stripeServer.subscriptionItems.createUsageRecord(subscription.items.data[1].id, // Get the metered price item
    {
        quantity: creditsUsed,
        timestamp,
        action: 'set',
    });
    console.log('Successfully updated subscription and usage');
}
main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
//# sourceMappingURL=update-subscriptions.js.map