import type Stripe from 'stripe';
export declare class WebhookProcessor {
    private stripeSignature;
    private rawBody;
    constructor(stripeSignature: string, rawBody: string);
    validateWebhook(): Promise<{
        valid: boolean;
        event?: Stripe.Event;
        error?: string;
    }>;
    private checkDuplicateEvent;
    processEvent(event: Stripe.Event): Promise<void>;
    private handleEvent;
    private handleSubscriptionChange;
    private handleSubscriptionDeletion;
    private handleInvoiceCreation;
    private handleInvoicePayment;
    private handlePaymentFailure;
    private getTotalReferralCredits;
    private mapStripeStatus;
}
