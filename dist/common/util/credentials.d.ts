import { z } from 'zod';
export declare const userSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodNullable<z.ZodString>;
    authToken: z.ZodString;
    fingerprintId: z.ZodString;
    fingerprintHash: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string | null;
    id: string;
    fingerprintId: string;
    authToken: string;
    fingerprintHash: string;
}, {
    email: string;
    name: string | null;
    id: string;
    fingerprintId: string;
    authToken: string;
    fingerprintHash: string;
}>;
export type User = z.infer<typeof userSchema>;
export declare const genAuthCode: (fingerprintId: string, expiresAt: string, secret: string) => string;
