export declare class PaymentGuards {
    private subscriptionId;
    constructor(subscriptionId: string);
    validatePaymentMethod(): Promise<{
        valid: boolean;
        error?: string;
    }>;
    handleFailedPayment(): Promise<void>;
    processPartialPayment(amountPaid: number): Promise<void>;
    handleRefund(amount: number): Promise<void>;
}
