"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const H = __importStar(require("../../src/helpers"));
const P = __importStar(require("../../src/persistence"));
const config_1 = __importDefault(require("../../src/config"));
const generator_1 = __importDefault(require("../../src/generator"));
const mdb_1 = __importDefault(require("../../src/mdb"));
const references_1 = __importDefault(require("../../src/references"));
let date = references_1.default.prod.dateStart;
const buildPrint = (id) => {
    const _id = `${id}`.padStart(2, '0');
    return (m) => {
        const time = new Date().toISOString().slice(11, 19);
        console.log(`[${time}][${_id}]: ${m}`);
    };
};
const workerBulkUpsert = (_, id) => __awaiter(void 0, void 0, void 0, function* () {
    const workerId = (references_1.default.clustersBatch - 1) * config_1.default.CLUSTER_ID + id;
    const print = buildPrint(workerId);
    print('Starting');
    while (true) {
        const filter = { dateEnd: references_1.default.load.dateEnd, worker: id };
        const base = yield P.base.getNotUsed(filter);
        if (base == null)
            break;
        const timestamp = new Date();
        yield P[config_1.default.APP.VERSION].bulkUpsert(base.transactions);
        const value = new Date().getTime() - timestamp.getTime();
        P.measurements
            .insertOne({ timestamp, type: 'bulkUpsert', value })
            .catch((e) => print(JSON.stringify(e)));
        yield references_1.default.prod.sleep.bulkUpsert(value);
        date = base.transactions[0].date;
        if (references_1.default.prod.shouldBreak())
            break;
    }
    print('Finished');
});
const workerGetReports = (_, id) => __awaiter(void 0, void 0, void 0, function* () {
    const workerId = (references_1.default.clustersBatch - 1) * config_1.default.CLUSTER_ID + id;
    const print = buildPrint(workerId);
    print('Starting');
    while (true) {
        const key = generator_1.default.getReportKey();
        const timestamp = new Date();
        yield P[config_1.default.APP.VERSION].getReports({ date, key });
        const value = new Date().getTime() - timestamp.getTime();
        P.measurements
            .insertOne({ timestamp, type: 'getReports', value })
            .catch((e) => print(JSON.stringify(e)));
        yield references_1.default.prod.sleep.getReports(value);
        if (references_1.default.prod.shouldBreak())
            break;
    }
    print('Finished');
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const worker = config_1.default.TYPE === 'bulkUpsert' ? workerBulkUpsert : workerGetReports;
    yield mdb_1.default.checkCollections();
    yield Promise.all(Array.from({ length: references_1.default.workersPerCluster }).map(worker));
    yield references_1.default.sleep(5 * 60 * 1000);
    yield H.storeCollectionStats(config_1.default.APP.VERSION, 'production');
    yield mdb_1.default.close();
});
main().catch((e) => console.dir(e, { depth: null }));
