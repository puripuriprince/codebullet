"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genAuthCode = exports.userSchema = void 0;
const zod_1 = require("zod");
const node_crypto_1 = __importDefault(require("node:crypto"));
exports.userSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string(),
    name: zod_1.z.string().nullable(),
    authToken: zod_1.z.string(),
    fingerprintId: zod_1.z.string(),
    fingerprintHash: zod_1.z.string(),
});
const genAuthCode = (fingerprintId, expiresAt, secret) => node_crypto_1.default
    .createHash('sha256')
    .update(secret)
    .update(fingerprintId)
    .update(expiresAt)
    .digest('hex');
exports.genAuthCode = genAuthCode;
//# sourceMappingURL=credentials.js.map