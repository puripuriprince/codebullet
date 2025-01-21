"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterDefined = filterDefined;
exports.buildArray = buildArray;
exports.groupConsecutive = groupConsecutive;
const lodash_1 = require("lodash");
function filterDefined(array) {
    return array.filter((item) => item !== null && item !== undefined);
}
function buildArray(...params) {
    return (0, lodash_1.compact)((0, lodash_1.flattenDeep)(params));
}
function groupConsecutive(xs, key) {
    if (!xs.length) {
        return [];
    }
    const result = [];
    let curr = { key: key(xs[0]), items: [xs[0]] };
    for (const x of xs.slice(1)) {
        const k = key(x);
        if (!(0, lodash_1.isEqual)(k, curr.key)) {
            result.push(curr);
            curr = { key: k, items: [x] };
        }
        else {
            curr.items.push(x);
        }
    }
    result.push(curr);
    return result;
}
//# sourceMappingURL=array.js.map