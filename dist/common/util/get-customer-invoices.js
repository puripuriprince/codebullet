"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCustomersWithInvoices = getAllCustomersWithInvoices;
exports.main = main;
const ts_pattern_1 = require("ts-pattern");
const stripe_1 = require("./stripe");
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
// Track subscription status for each customer
const subscription_statuses = new Map();
async function getAllCustomersWithInvoices() {
    const customers = [];
    let hasMore = true;
    let startingAfter = undefined;
    // Iterate through all subscriptions using cursor pagination
    while (hasMore) {
        const result = await stripe_1.stripeServer.subscriptions.list({
            limit: 100,
            starting_after: startingAfter,
            status: 'all',
            expand: ['data.items'],
        });
        const { data, has_more } = result;
        // Process each subscription
        for (const subscription of data) {
            // Skip if no metered items in subscription
            const hasMeteredItem = subscription.items.data.some((item) => item.price.recurring?.usage_type === 'metered');
            if (!hasMeteredItem) {
                continue;
            }
            try {
                const customerId = getCustomerId(subscription.customer);
                const invoices = await stripe_1.stripeServer.invoices.list({
                    customer: customerId,
                    limit: 2, // Get 2 to verify they have more than one
                    status: 'paid',
                });
                const customer = await stripe_1.stripeServer.customers.retrieve(subscription.customer);
                if (customer.deleted) {
                    console.log(`Customer ${customer.id} has been deleted, skipping`);
                    continue;
                }
                if (invoices.data.length < 2) {
                    console.log(`Customer ${customer.email} has fewer than 2 paid invoices, skipping`);
                    continue;
                }
                const lastInvoice = invoices.data[0];
                if (lastInvoice.amount_paid === 0) {
                    console.log(`Customer ${customer.email} paid $0 on last invoice, skipping`);
                    continue;
                }
                subscription_statuses.set(customer.id, {
                    cancelled: !!subscription.cancellation_details?.reason,
                });
                customers.push({
                    customerId: customer.id,
                    email: customer.email ?? null,
                    name: customer.name ?? null,
                    lastInvoice: {
                        amount: lastInvoice.amount_paid,
                        date: new Date(lastInvoice.created * 1000),
                    },
                });
            }
            catch (error) {
                console.log(`Error getting invoice for subscription ${subscription.id}`);
            }
        }
        hasMore = has_more;
        if (hasMore && data.length > 0) {
            startingAfter = data[data.length - 1].id;
        }
    }
    return customers;
}
// Example usage
async function main() {
    try {
        const customers = await getAllCustomersWithInvoices();
        // Split into active and cancelled customers
        const activeCustomers = customers.filter((c) => !subscription_statuses.get(c.customerId)?.cancelled);
        const cancelledCustomers = customers.filter((c) => subscription_statuses.get(c.customerId)?.cancelled);
        console.log('Active customers with past invoices:');
        activeCustomers.forEach((customer) => {
            console.log(`
Customer: ${customer.name} (${customer.email})
Last Invoice: ${(customer.lastInvoice.amount / 100).toFixed(2)} on ${customer.lastInvoice.date}
`);
        });
        console.log('\nCancelled customers with past invoices:');
        cancelledCustomers.forEach((customer) => {
            console.log(`
Customer: ${customer.name} (${customer.email})
Last Invoice: ${(customer.lastInvoice.amount / 100).toFixed(2)} on ${customer.lastInvoice.date}
`);
        });
        const total = customers.reduce((sum, customer) => sum + customer.lastInvoice.amount, 0);
        const totalInDollars = total / 100; // Convert cents to dollars
        const average = totalInDollars / customers.length || 0;
        console.log(`\nTotal invoice amount (all customers): $${totalInDollars.toFixed(2)}`);
        console.log(`Average invoice amount (all customers): $${average.toFixed(2)}`);
        console.log(`Total active customers: ${activeCustomers.length}`);
        console.log(`Total cancelled customers: ${cancelledCustomers.length}`);
    }
    catch (error) {
        console.error('Error fetching customer data:', error);
    }
}
//# sourceMappingURL=get-customer-invoices.js.map