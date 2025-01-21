export interface InvoiceLineItem {
    amount: number;
    description: string;
    period?: {
        start: number;
        end: number;
    };
    proration: boolean;
}
export interface SubscriptionPreviewResponse {
    currentMonthlyRate: number;
    newMonthlyRate: number;
    daysRemainingInBillingPeriod: number;
    prorationDate: number;
    lineItems: InvoiceLineItem[];
    overageCredits: number;
    newOverageCredits: number;
    currentOverageAmount: number;
    newOverageAmount: number;
    currentOverageRate: number | null;
    newOverageRate: number;
    currentQuota: number;
    creditsUsed: number;
}
