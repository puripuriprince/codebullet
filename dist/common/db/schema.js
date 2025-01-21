"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationToken = exports.session = exports.message = exports.fingerprint = exports.referral = exports.account = exports.user = exports.ReferralStatus = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const referral_1 = require("../types/referral");
// Define the ReferralStatus enum
exports.ReferralStatus = (0, pg_core_1.pgEnum)('referral_status', [
    referral_1.ReferralStatusValues[0],
    ...referral_1.ReferralStatusValues.slice(1),
]);
exports.user = (0, pg_core_1.pgTable)('user', {
    id: (0, pg_core_1.text)('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: (0, pg_core_1.text)('name'),
    email: (0, pg_core_1.text)('email').unique().notNull(),
    password: (0, pg_core_1.text)('password'),
    emailVerified: (0, pg_core_1.timestamp)('emailVerified', { mode: 'date' }),
    image: (0, pg_core_1.text)('image'),
    subscription_active: (0, pg_core_1.boolean)('subscription_active').notNull().default(false),
    stripe_customer_id: (0, pg_core_1.text)('stripe_customer_id').unique(),
    stripe_price_id: (0, pg_core_1.text)('stripe_price_id'),
    quota: (0, pg_core_1.integer)('quota').notNull().default(0),
    quota_exceeded: (0, pg_core_1.boolean)('quota_exceeded').notNull().default(false),
    next_quota_reset: (0, pg_core_1.timestamp)('next_quota_reset', { mode: 'date' }).default((0, drizzle_orm_1.sql) `now() + INTERVAL '1 month'`),
    created_at: (0, pg_core_1.timestamp)('created_at', { mode: 'date' }).notNull().defaultNow(),
    referral_code: (0, pg_core_1.text)('referral_code')
        .unique()
        .default((0, drizzle_orm_1.sql) `'ref-' || gen_random_uuid()`),
    referral_limit: (0, pg_core_1.integer)('referral_limit').notNull().default(5),
});
exports.account = (0, pg_core_1.pgTable)('account', {
    userId: (0, pg_core_1.text)('userId')
        .notNull()
        .references(() => exports.user.id, { onDelete: 'cascade' }),
    type: (0, pg_core_1.text)('type').$type().notNull(),
    provider: (0, pg_core_1.text)('provider').notNull(),
    providerAccountId: (0, pg_core_1.text)('providerAccountId').notNull(),
    refresh_token: (0, pg_core_1.text)('refresh_token'),
    access_token: (0, pg_core_1.text)('access_token'),
    expires_at: (0, pg_core_1.integer)('expires_at'),
    token_type: (0, pg_core_1.text)('token_type'),
    scope: (0, pg_core_1.text)('scope'),
    id_token: (0, pg_core_1.text)('id_token'),
    session_state: (0, pg_core_1.text)('session_state'),
}, (account) => [
    (0, pg_core_1.primaryKey)({
        columns: [account.provider, account.providerAccountId],
    }),
]);
exports.referral = (0, pg_core_1.pgTable)('referral', {
    referrer_id: (0, pg_core_1.text)('referrer_id')
        .notNull()
        .references(() => exports.user.id),
    referred_id: (0, pg_core_1.text)('referred_id')
        .notNull()
        .references(() => exports.user.id),
    status: (0, exports.ReferralStatus)('status').notNull().default('pending'),
    credits: (0, pg_core_1.integer)('credits').notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at', { mode: 'date' })
        .notNull()
        .defaultNow(),
    completed_at: (0, pg_core_1.timestamp)('completed_at', { mode: 'date' }),
}, (table) => [(0, pg_core_1.primaryKey)({ columns: [table.referrer_id, table.referred_id] })]);
exports.fingerprint = (0, pg_core_1.pgTable)('fingerprint', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    sig_hash: (0, pg_core_1.text)('sig_hash'),
    quota_exceeded: (0, pg_core_1.boolean)('quota_exceeded').notNull().default(false),
    next_quota_reset: (0, pg_core_1.timestamp)('next_quota_reset', { mode: 'date' }).default((0, drizzle_orm_1.sql) `now() + INTERVAL '1 month'`),
    created_at: (0, pg_core_1.timestamp)('created_at', { mode: 'date' }).notNull().defaultNow(),
});
exports.message = (0, pg_core_1.pgTable)('message', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    finished_at: (0, pg_core_1.timestamp)('finished_at', { mode: 'date' }).notNull(),
    client_id: (0, pg_core_1.text)('client_id').notNull(), // TODO: `CHECK` that this starts w/ prefix `mc-client-`
    client_request_id: (0, pg_core_1.text)('client_request_id').notNull(), // TODO: `CHECK` that this starts w/ prefix `mc-input-`
    model: (0, pg_core_1.text)('model').notNull(),
    request: (0, pg_core_1.jsonb)('request').notNull(),
    lastMessage: (0, pg_core_1.jsonb)('last_message').generatedAlwaysAs(() => (0, drizzle_orm_1.sql) `${exports.message.request} -> -1`),
    response: (0, pg_core_1.jsonb)('response').notNull(),
    input_tokens: (0, pg_core_1.integer)('input_tokens').notNull().default(0),
    cache_creation_input_tokens: (0, pg_core_1.integer)('cache_creation_input_tokens')
        .notNull()
        .default(0),
    cache_read_input_tokens: (0, pg_core_1.integer)('cache_read_input_tokens')
        .notNull()
        .default(0),
    output_tokens: (0, pg_core_1.integer)('output_tokens').notNull(),
    cost: (0, pg_core_1.numeric)('cost', { precision: 100, scale: 20 }).notNull(),
    credits: (0, pg_core_1.integer)('credits').notNull(),
    latency_ms: (0, pg_core_1.integer)('latency_ms'),
    user_id: (0, pg_core_1.text)('user_id').references(() => exports.user.id, { onDelete: 'cascade' }),
    fingerprint_id: (0, pg_core_1.text)('fingerprint_id')
        .references(() => exports.fingerprint.id, { onDelete: 'cascade' })
        .notNull(),
}, (table) => [
    (0, pg_core_1.index)('message_fingerprint_id_idx').on(table.fingerprint_id),
    (0, pg_core_1.index)('message_user_id_idx').on(table.user_id),
]);
exports.session = (0, pg_core_1.pgTable)('session', {
    sessionToken: (0, pg_core_1.text)('sessionToken').notNull().primaryKey(),
    userId: (0, pg_core_1.text)('userId')
        .notNull()
        .references(() => exports.user.id, { onDelete: 'cascade' }),
    expires: (0, pg_core_1.timestamp)('expires', { mode: 'date' }).notNull(),
    fingerprint_id: (0, pg_core_1.text)('fingerprint_id').references(() => exports.fingerprint.id),
});
exports.verificationToken = (0, pg_core_1.pgTable)('verificationToken', {
    identifier: (0, pg_core_1.text)('identifier').notNull(),
    token: (0, pg_core_1.text)('token').notNull(),
    expires: (0, pg_core_1.timestamp)('expires', { mode: 'date' }).notNull(),
}, (vt) => [(0, pg_core_1.primaryKey)({ columns: [vt.identifier, vt.token] })]);
//# sourceMappingURL=schema.js.map