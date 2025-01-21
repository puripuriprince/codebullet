"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeServer = void 0;
const stripe_1 = __importDefault(require("stripe"));
const env_mjs_1 = require("../env.mjs");
exports.stripeServer = new stripe_1.default(env_mjs_1.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
});
// stripeServer.on('request', (request) => {
//   console.log('Stripe API Request', request)
// })
// // Listen for response events
// stripeServer.on('response', (response) => {
//   console.log('Stripe API Response', response)
// })
//# sourceMappingURL=stripe.js.map