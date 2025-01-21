"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_MESSAGE_SCHEMA = exports.SERVER_MESSAGE_SCHEMAS = exports.CLIENT_MESSAGE_SCHEMA = exports.CLIENT_MESSAGE_SCHEMAS = void 0;
const zod_1 = require("zod");
const actions_1 = require("../actions");
exports.CLIENT_MESSAGE_SCHEMAS = {
    identify: zod_1.z.object({
        type: zod_1.z.literal('identify'),
        txid: zod_1.z.number(),
        clientSessionId: zod_1.z.string(),
    }),
    subscribe: zod_1.z.object({
        type: zod_1.z.literal('subscribe'),
        txid: zod_1.z.number(),
        topics: zod_1.z.array(zod_1.z.string()),
    }),
    unsubscribe: zod_1.z.object({
        type: zod_1.z.literal('unsubscribe'),
        txid: zod_1.z.number(),
        topics: zod_1.z.array(zod_1.z.string()),
    }),
    ping: zod_1.z.object({
        type: zod_1.z.literal('ping'),
        txid: zod_1.z.number(),
    }),
    action: zod_1.z.object({
        type: zod_1.z.literal('action'),
        txid: zod_1.z.number(),
        data: actions_1.CLIENT_ACTION_SCHEMA,
    }),
};
exports.CLIENT_MESSAGE_SCHEMA = zod_1.z.union([
    exports.CLIENT_MESSAGE_SCHEMAS.identify,
    exports.CLIENT_MESSAGE_SCHEMAS.subscribe,
    exports.CLIENT_MESSAGE_SCHEMAS.unsubscribe,
    exports.CLIENT_MESSAGE_SCHEMAS.ping,
    exports.CLIENT_MESSAGE_SCHEMAS.action,
]);
exports.SERVER_MESSAGE_SCHEMAS = {
    ack: zod_1.z.object({
        type: zod_1.z.literal('ack'),
        txid: zod_1.z.number().optional(),
        success: zod_1.z.boolean(),
        error: zod_1.z.string().optional(),
    }),
    action: zod_1.z.object({
        type: zod_1.z.literal('action'),
        data: actions_1.SERVER_ACTION_SCHEMA,
    }),
};
exports.SERVER_MESSAGE_SCHEMA = zod_1.z.union([
    exports.SERVER_MESSAGE_SCHEMAS.ack,
    exports.SERVER_MESSAGE_SCHEMAS.action,
]);
//# sourceMappingURL=websocket-schema.js.map