"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllMonthOverages = getAllMonthOverages;
exports.main = main;
const stripe_1 = require("./stripe");
const ts_pattern_1 = require("ts-pattern");
const getCustomerId = (customer) => {
    return (0, ts_pattern_1.match)(customer)
        .with(
    // string ID case
    ts_pattern_1.P.string, (id) => id)
        .with(
    // Customer or DeletedCustomer case
    { object: 'customer' }, (customer) => customer.id)
        .exhaustive();
};
async function getAllMonthOverages() {
    const customersWithOverage = [];
    let hasMore = true;
    let startingAfter = undefined;
    // Iterate through all subscriptions using cursor pagination
    while (hasMore) {
        const result = await stripe_1.stripeServer.subscriptions.list({
            limit: 100,
            starting_after: startingAfter,
            status: 'active',
            expand: ['data.items'],
        });
        const { data, has_more } = result;
        // Process each subscription
        for (const subscription of data) {
            // Check for metered items in subscription
            const hasMeteredItem = subscription.items.data.some((item) => item.price.recurring?.usage_type === 'metered');
            if (!hasMeteredItem) {
                console.log(`Subscription ${subscription.id} has no metered items, skipping`);
                continue;
            }
            console.log(`Found metered subscription: ${subscription.id}`);
            try {
                const customerId = getCustomerId(subscription.customer);
                const customer = await stripe_1.stripeServer.customers.retrieve(subscription.customer);
                if (customer.deleted) {
                    console.log(`Customer ${customer.id} has been deleted, skipping`);
                    continue;
                }
                // Get upcoming invoice
                const upcomingInvoice = await stripe_1.stripeServer.invoices.retrieveUpcoming({
                    customer: customerId,
                    subscription: subscription.id,
                });
                // Calculate metered items total from upcoming invoice
                const meteredOverageItems = upcomingInvoice.lines.data
                    .filter(item => item.price?.recurring?.usage_type === 'metered');
                console.log(`Customer ${customer.email}: Found ${meteredOverageItems.length} metered items in upcoming invoice`);
                console.log(`Customer ${customer.email}: Metered items:`, meteredOverageItems.map(item => ({
                    amount: item.amount,
                    description: item.description,
                    period: item.period
                })));
                const monthlyOverageTotal = meteredOverageItems.reduce((sum, item) => sum + item.amount, 0);
                if (monthlyOverageTotal > 0) {
                    console.log(`Customer ${customer.email}: Upcoming metered charges: $${(monthlyOverageTotal / 100).toFixed(2)}`);
                    customersWithOverage.push({
                        customerId: customer.id,
                        email: customer.email ?? null,
                        name: customer.name ?? null,
                        overageInvoice: {
                            amount: monthlyOverageTotal,
                            date: new Date(upcomingInvoice.period_end * 1000),
                        },
                    });
                }
                else {
                    // If no upcoming charges, check recent invoices
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    const recentInvoices = await stripe_1.stripeServer.invoices.list({
                        customer: customerId,
                        limit: 1,
                        status: 'paid',
                        created: {
                            gte: Math.floor(oneMonthAgo.getTime() / 1000),
                        },
                    });
                    if (recentInvoices.data.length > 0) {
                        const lastInvoice = recentInvoices.data[0];
                        const recentOverageItems = lastInvoice.lines.data
                            .filter(item => item.price?.recurring?.usage_type === 'metered');
                        console.log(`Customer ${customer.email}: Found ${recentOverageItems.length} metered items in recent invoice`);
                        console.log(`Customer ${customer.email}: Recent metered items:`, recentOverageItems.map(item => ({
                            amount: item.amount,
                            description: item.description,
                            period: item.period
                        })));
                        const recentOverageTotal = recentOverageItems.reduce((sum, item) => sum + item.amount, 0);
                        if (recentOverageTotal > 0) {
                            console.log(`Customer ${customer.email}: Recent metered charges: $${(recentOverageTotal / 100).toFixed(2)}`);
                            customersWithOverage.push({
                                customerId: customer.id,
                                email: customer.email ?? null,
                                name: customer.name ?? null,
                                overageInvoice: {
                                    amount: recentOverageTotal,
                                    date: new Date(lastInvoice.created * 1000),
                                },
                            });
                        }
                    }
                }
            }
            catch (error) {
                console.log(`Error getting upcoming invoice for subscription ${subscription.id}:`, error);
            }
        }
        hasMore = has_more;
        if (hasMore && data.length > 0) {
            startingAfter = data[data.length - 1].id;
        }
    }
    return customersWithOverage;
}
async function main() {
    try {
        const customersWithOverage = await getAllMonthOverages();
        console.log('Monthly overage charges:');
        customersWithOverage.forEach((customer) => {
            console.log(`
Customer: ${customer.name} (${customer.email})
Monthly Overage: $${(customer.overageInvoice.amount / 100).toFixed(2)} due on ${customer.overageInvoice.date}
`);
        });
        const totalOverage = customersWithOverage.reduce((sum, customer) => sum + customer.overageInvoice.amount, 0);
        const totalOverageInDollars = totalOverage / 100;
        const averageOverage = totalOverageInDollars / customersWithOverage.length || 0;
        console.log(`\nTotal monthly overage: $${totalOverageInDollars.toFixed(2)}`);
        console.log(`Average monthly overage: $${averageOverage.toFixed(2)}`);
        console.log(`Total customers with overage charges: ${customersWithOverage.length}`);
    }
    catch (error) {
        console.error('Error fetching monthly overage data:', error);
    }
}
//# sourceMappingURL=get-month-overage.js.map