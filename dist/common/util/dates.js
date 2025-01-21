"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextQuotaReset = void 0;
const getNextQuotaReset = (currentQuotaReset) => {
    const now = new Date();
    let nextMonth = new Date(currentQuotaReset ?? now);
    while (nextMonth <= now) {
        nextMonth.setMonth(nextMonth.getMonth() + 1);
    }
    return nextMonth;
};
exports.getNextQuotaReset = getNextQuotaReset;
//# sourceMappingURL=dates.js.map