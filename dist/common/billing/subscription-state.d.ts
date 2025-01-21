import { z } from 'zod';
export type SubscriptionState = 'active' | 'past_due' | 'incomplete' | 'canceled' | 'trialing' | 'paused' | 'transitioning';
export declare const subscriptionStateSchema: z.ZodEnum<["active", "past_due", "incomplete", "canceled", "trialing", "paused", "transitioning"]>;
export declare class SubscriptionStateManager {
    private subscriptionId;
    private transitionLock;
    constructor(subscriptionId: string);
    getCurrentState(): Promise<SubscriptionState>;
    beginStateTransition(): Promise<boolean>;
    endStateTransition(): Promise<void>;
    addStateHistoryEntry(fromState: SubscriptionState, toState: SubscriptionState, reason?: string): Promise<void>;
    private mapStripeState;
}
