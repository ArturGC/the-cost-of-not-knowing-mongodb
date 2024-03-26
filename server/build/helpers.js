"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportDates = void 0;
const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
const getReportDates = (date) => {
    return [
        { end: date, start: new Date(date.getTime() - oneYearInMs) },
        { end: date, start: new Date(date.getTime() - 2.5 * oneYearInMs) },
        { end: date, start: new Date(date.getTime() - 5 * oneYearInMs) },
        { end: date, start: new Date(date.getTime() - 7.5 * oneYearInMs) },
        { end: date, start: new Date(date.getTime() - 10 * oneYearInMs) },
    ];
};
exports.getReportDates = getReportDates;
