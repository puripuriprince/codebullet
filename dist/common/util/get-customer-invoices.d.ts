declare function getAllCustomersWithInvoices(): Promise<{
    customerId: string;
    email: string | null;
    name: string | null;
    lastInvoice: {
        amount: number;
        date: Date;
    };
}[]>;
declare function main(): Promise<void>;
export { getAllCustomersWithInvoices, main };
