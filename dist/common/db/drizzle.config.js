"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
const env_mjs_1 = require("./env.mjs");
const path_1 = __importDefault(require("path"));
exports.default = (0, drizzle_kit_1.defineConfig)({
    dialect: 'postgresql',
    schema: path_1.default.join(__dirname, 'schema.ts').replace(/\\/g, '/'),
    out: 'src/db/migrations',
    dbCredentials: {
        url: env_mjs_1.env.DATABASE_URL,
    },
});
//# sourceMappingURL=drizzle.config.js.map