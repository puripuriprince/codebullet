"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemInfo = void 0;
const process_1 = require("process");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const getSystemInfo = () => {
    const shell = process.env.SHELL || process.env.COMSPEC || 'unknown';
    return {
        platform: process_1.platform,
        shell: path_1.default.basename(shell),
        nodeVersion: process.version,
        arch: process.arch,
        homedir: os_1.default.homedir(),
        cpus: os_1.default.cpus().length,
    };
};
exports.getSystemInfo = getSystemInfo;
//# sourceMappingURL=system-info.js.map