"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websocketUrl = exports.isProduction = void 0;
exports.isProduction = process.env.ENVIRONMENT === 'production';
exports.websocketUrl = exports.isProduction
    ? `wss://${process.env.NEXT_PUBLIC_BACKEND_URL}/ws`
    : `ws://${process.env.NEXT_PUBLIC_BACKEND_URL}/ws`;
//# sourceMappingURL=config.js.map