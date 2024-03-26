"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReports = exports.getReport = exports.bulkUpsert = void 0;
const helpers_1 = require("../helpers");
const mdb_1 = __importDefault(require("../mdb"));
const buildId = (key, date) => {
    const dateFormatted = date
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '')
        .slice(0, 6);
    return Buffer.from(`${key}${dateFormatted}`, 'hex');
};
const getDayFromDate = (date) => {
    return date.toISOString().split('T')[0].replace(/-/g, '').slice(6);
};
const bulkUpsert = (docs) => __awaiter(void 0, void 0, void 0, function* () {
    const upsertOperations = docs.map((doc) => {
        const dayNumber = getDayFromDate(doc.date);
        return {
            updateOne: {
                filter: {
                    _id: buildId(doc.key, doc.date),
                },
                update: {
                    $inc: {
                        [`items.${dayNumber}.a`]: doc.approved,
                        [`items.${dayNumber}.n`]: doc.noFunds,
                        [`items.${dayNumber}.p`]: doc.pending,
                        [`items.${dayNumber}.r`]: doc.rejected,
                    },
                },
                upsert: true,
            },
        };
    });
    return mdb_1.default.collections.appV5.bulkWrite(upsertOperations, { ordered: false });
});
exports.bulkUpsert = bulkUpsert;
const buildLogicForType = (type, key, date) => {
    const lowerId = buildId(key, date.start);
    const lowerDay = date.start.getDate().toString();
    const upperId = buildId(key, date.end);
    const upperDay = date.end.getDate().toString();
    return {
        $add: [
            {
                $cond: [
                    {
                        $and: [
                            `$$this.v.${type}`,
                            {
                                $or: [
                                    {
                                        $and: [
                                            { $eq: ['$_id', lowerId] },
                                            { $gte: ['$$this.k', lowerDay] },
                                        ],
                                    },
                                    {
                                        $and: [
                                            { $gt: ['$_id', lowerId] },
                                            { $lt: ['$_id', upperId] },
                                        ],
                                    },
                                    {
                                        $and: [
                                            { $eq: ['$_id', upperId] },
                                            { $lt: ['$$this.k', upperDay] },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    `$$this.v.${type}`,
                    0,
                ],
            },
            `$$value.${type}`,
        ],
    };
};
const getReport = (filter) => __awaiter(void 0, void 0, void 0, function* () {
    const lowerId = buildId(filter.key, filter.date.start);
    const upperId = buildId(filter.key, filter.date.end);
    const [result] = yield mdb_1.default.collections.appV5
        .aggregate([
        {
            $match: {
                _id: { $gte: lowerId, $lte: upperId },
            },
        },
        {
            $addFields: {
                report: {
                    $reduce: {
                        input: { $objectToArray: '$items' },
                        initialValue: { a: 0, n: 0, p: 0, r: 0 },
                        in: {
                            a: buildLogicForType('a', filter.key, filter.date),
                            n: buildLogicForType('n', filter.key, filter.date),
                            p: buildLogicForType('p', filter.key, filter.date),
                            r: buildLogicForType('r', filter.key, filter.date),
                        },
                    },
                },
            },
        },
        {
            $group: {
                _id: null,
                approved: { $sum: '$report.a' },
                noFunds: { $sum: '$report.n' },
                pending: { $sum: '$report.p' },
                rejected: { $sum: '$report.r' },
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
    ])
        .toArray();
    return result;
});
exports.getReport = getReport;
const getReports = ({ date, key, }) => __awaiter(void 0, void 0, void 0, function* () {
    const reportDates = (0, helpers_1.getReportDates)(date);
    return Promise.all(reportDates.map((date) => __awaiter(void 0, void 0, void 0, function* () { return (0, exports.getReport)({ date, key }); })));
});
exports.getReports = getReports;
