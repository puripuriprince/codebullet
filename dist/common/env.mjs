"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const env_core_1 = require("@t3-oss/env-core");
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../stack.env' });
if (!process.env.NEXT_PUBLIC_ENVIRONMENT) {
    console.error('ENVIRONMENT is not set, please check `stack.env`');
    process.exit(1);
}
const DOTENV_PATH = process.env.RENDER === 'true' ? '/etc/secrets' : '..';
const path = `${DOTENV_PATH}/.env.${process.env.NEXT_PUBLIC_ENVIRONMENT}`;
console.log(`Using environment: ${process.env.NEXT_PUBLIC_ENVIRONMENT} (path: ${path})`);
dotenv_1.default.config({ path });
exports.env = (0, env_core_1.createEnv)({
    server: {
        ENVIRONMENT: zod_1.z.string().min(1),
        NEXT_PUBLIC_ENVIRONMENT: zod_1.z.string().min(1),
        DATABASE_URL: zod_1.z.string().min(1),
        STRIPE_SECRET_KEY: zod_1.z.string().min(1),
        NEXT_PUBLIC_SUPPORT_EMAIL: zod_1.z.string().min(1),
    },
    client: {
        NEXT_PUBLIC_ENVIRONMENT: zod_1.z.string().min(1),
        NEXT_PUBLIC_APP_URL: zod_1.z.string().min(1),
        NEXT_PUBLIC_SUPPORT_EMAIL: zod_1.z.string().min(1),
    },
    runtimeEnv: process.env,
});
//# sourceMappingURL=env.mjs.map