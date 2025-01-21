"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.didClientUseTool = void 0;
const ts_pattern_1 = require("ts-pattern");
const constants_1 = require("src/constants");
const didClientUseTool = (message) => (0, ts_pattern_1.match)(message)
    .with({
    role: 'user',
    content: ts_pattern_1.P.string.and(ts_pattern_1.P.when((content) => content.includes(constants_1.TOOL_RESULT_MARKER))),
}, () => true)
    .otherwise(() => false);
exports.didClientUseTool = didClientUseTool;
//# sourceMappingURL=tools.js.map