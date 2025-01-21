declare function getAllUpcomingInvoices(): Promise<{
    customerId: string;
    email: string | null;
    name: string | null;
    upcomingInvoice: {
        amount: number;
        date: Date;
    };
}[]>;
declare function main(): Promise<void>;
export { getAllUpcomingInvoices, main };
