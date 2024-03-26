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
const bulkUpsert = (docs) => __awaiter(void 0, void 0, void 0, function* () {
    const upsertOperations = docs.map((doc) => {
        return {
            updateOne: {
                filter: { date: doc.date, key: doc.key },
                update: {
                    $inc: {
                        approved: doc.approved,
                        noFunds: doc.noFunds,
                        pending: doc.pending,
                        rejected: doc.rejected,
                    },
                },
                upsert: true,
            },
        };
    });
    return mdb_1.default.collections.appV2.bulkWrite(upsertOperations, { ordered: false });
});
exports.bulkUpsert = bulkUpsert;
const getReport = (filter) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield mdb_1.default.collections.appV2
        .aggregate([
        {
            $match: {
                date: { $gte: filter.date.start, $lt: filter.date.end },
                key: filter.key,
            },
        },
        {
            $group: {
                _id: null,
                approved: { $sum: '$approved' },
                noFunds: { $sum: '$noFunds' },
                pending: { $sum: '$pending' },
                rejected: { $sum: '$rejected' },
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
