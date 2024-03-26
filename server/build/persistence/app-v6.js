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
                        'report.a': doc.approved,
                        'report.n': doc.noFunds,
                        'report.p': doc.pending,
                        'report.r': doc.rejected,
                    },
                },
                upsert: true,
            },
        };
    });
    return mdb_1.default.collections.appV6.bulkWrite(upsertOperations, { ordered: false });
});
exports.bulkUpsert = bulkUpsert;
const buildLogicForLoop = (key, date) => {
    const lowerId = buildId(key, date.start);
    const lowerDay = date.start.getDate().toString();
    const upperId = buildId(key, date.end);
    const upperDay = date.end.getDate().toString();
    return {
        $cond: {
            if: {
                $or: [
                    {
                        $and: [
                            { $eq: ['$_id', lowerId] },
                            { $gte: ['$$this.k', lowerDay] },
                        ],
                    },
                    {
                        $and: [{ $gt: ['$_id', lowerId] }, { $lt: ['$_id', upperId] }],
                    },
                    {
                        $and: [{ $eq: ['$_id', upperId] }, { $lt: ['$$this.k', upperDay] }],
                    },
                ],
            },
            then: {
                a: { $add: ['$$value.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                n: { $add: ['$$value.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                p: { $add: ['$$value.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                r: { $add: ['$$value.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
            },
            else: '$$value',
        },
    };
};
const getReport = (filter) => __awaiter(void 0, void 0, void 0, function* () {
    const lowerId = buildId(filter.key, filter.date.start);
    const upperId = buildId(filter.key, filter.date.end);
    const pipeline = [
        {
            $match: {
                _id: { $gte: lowerId, $lte: upperId },
            },
        },
        {
            $addFields: {
                report: {
                    $cond: {
                        if: {
                            $and: [{ $gte: ['$_id', lowerId] }, { $lt: ['$_id', upperId] }],
                        },
                        then: '$report',
                        else: {
                            $reduce: {
                                input: { $objectToArray: '$items' },
                                initialValue: { a: 0, n: 0, p: 0, r: 0 },
                                in: buildLogicForLoop(filter.key, filter.date),
                            },
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
    ];
    // console.dir(pipeline, { depth: null });
    const [result] = yield mdb_1.default.collections.appV6.aggregate(pipeline).toArray();
    return result;
});
exports.getReport = getReport;
const getReports = ({ date, key, }) => __awaiter(void 0, void 0, void 0, function* () {
    const reportDates = (0, helpers_1.getReportDates)(date);
    return Promise.all(reportDates.map((date) => __awaiter(void 0, void 0, void 0, function* () { return (0, exports.getReport)({ date, key }); })));
});
exports.getReports = getReports;
