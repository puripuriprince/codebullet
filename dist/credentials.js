"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CREDENTIALS_PATH = exports.userFromJson = void 0;
const credentials_1 = require("./common/util/credentials");
const zod_1 = require("zod");
const os_1 = __importDefault(require("os"));
const node_path_1 = __importDefault(require("node:path"));
const credentialsSchema = zod_1.z
    .object({
    default: credentials_1.userSchema,
})
    .catchall(credentials_1.userSchema);
const userFromJson = (json, profileName = 'default') => {
    try {
        const allCredentials = credentialsSchema.parse(JSON.parse(json));
        const profile = allCredentials[profileName];
        return profile;
    }
    catch (error) {
        console.error('Error parsing user JSON:', error);
        return;
    }
};
exports.userFromJson = userFromJson;
exports.CREDENTIALS_PATH = node_path_1.default.join(os_1.default.homedir(), '.config', 'manicode' +
    // on a development stack?
    (process.env.ENVIRONMENT && process.env.ENVIRONMENT !== 'production'
        ? `-${process.env.ENVIRONMENT}`
        : ''), 'credentials.json');
//# sourceMappingURL=credentials.js.map