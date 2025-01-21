declare function getAllMonthOverages(): Promise<{
    customerId: string;
    email: string | null;
    name: string | null;
    overageInvoice: {
        amount: number;
        date: Date;
    };
}[]>;
declare function main(): Promise<void>;
export { getAllMonthOverages, main };
