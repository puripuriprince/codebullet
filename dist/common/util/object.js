"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterObject = exports.hasSignificantDeepChanges = exports.hasChanges = exports.subtractObjects = exports.addObjects = exports.removeNullOrUndefinedProps = exports.removeUndefinedProps = void 0;
exports.assert = assert;
const lodash_1 = require("lodash");
const removeUndefinedProps = (obj) => {
    const newObj = {};
    for (const key of Object.keys(obj)) {
        if (obj[key] !== undefined)
            newObj[key] = obj[key];
    }
    return newObj;
};
exports.removeUndefinedProps = removeUndefinedProps;
const removeNullOrUndefinedProps = (obj, exceptions) => {
    const newObj = {};
    for (const key of Object.keys(obj)) {
        if ((obj[key] !== undefined && obj[key] !== null) ||
            (exceptions ?? []).includes(key))
            newObj[key] = obj[key];
    }
    return newObj;
};
exports.removeNullOrUndefinedProps = removeNullOrUndefinedProps;
const addObjects = (obj1, obj2) => {
    const keys = (0, lodash_1.union)(Object.keys(obj1), Object.keys(obj2));
    const newObj = {};
    for (const key of keys) {
        newObj[key] = (obj1[key] ?? 0) + (obj2[key] ?? 0);
    }
    return newObj;
};
exports.addObjects = addObjects;
const subtractObjects = (obj1, obj2) => {
    const keys = (0, lodash_1.union)(Object.keys(obj1), Object.keys(obj2));
    const newObj = {};
    for (const key of keys) {
        newObj[key] = (obj1[key] ?? 0) - (obj2[key] ?? 0);
    }
    return newObj;
};
exports.subtractObjects = subtractObjects;
const hasChanges = (obj, partial) => {
    const currValues = (0, lodash_1.mapValues)(partial, (_, key) => obj[key]);
    return !(0, lodash_1.isEqual)(currValues, partial);
};
exports.hasChanges = hasChanges;
const hasSignificantDeepChanges = (obj, partial, epsilonForNumbers) => {
    const compareValues = (currValue, partialValue) => {
        if (typeof currValue === 'number' && typeof partialValue === 'number') {
            return Math.abs(currValue - partialValue) > epsilonForNumbers;
        }
        if (typeof currValue === 'object' && typeof partialValue === 'object') {
            return (0, exports.hasSignificantDeepChanges)(currValue, partialValue, epsilonForNumbers);
        }
        return !(0, lodash_1.isEqual)(currValue, partialValue);
    };
    for (const key in partial) {
        if (Object.prototype.hasOwnProperty.call(partial, key)) {
            if (compareValues(obj[key], partial[key])) {
                return true;
            }
        }
    }
    return false;
};
exports.hasSignificantDeepChanges = hasSignificantDeepChanges;
const filterObject = (obj, predicate) => {
    const result = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (predicate(obj[key], key)) {
                result[key] = obj[key];
            }
        }
    }
    return result;
};
exports.filterObject = filterObject;
/**
 * Asserts that a condition is true. If the condition is false, it throws an error with the provided message.
 * @param condition The condition to check
 * @param message The error message to display if the condition is false
 * @throws {Error} If the condition is false
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}
//# sourceMappingURL=object.js.map