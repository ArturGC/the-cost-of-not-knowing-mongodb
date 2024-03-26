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
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class Mongo {
    constructor() {
        this.options = {
            appName: 'API Server',
            ignoreUndefined: true,
            readPreference: 'primary',
            writeConcern: { journal: true, w: 'majority' },
        };
        this.connect = (args, options) => __awaiter(this, void 0, void 0, function* () {
            this.client = new mongodb_1.MongoClient(args.uri, options);
            this.db = this.client.db(args.dbName);
            this.collections = this.getCollections();
        });
        this.close = () => __awaiter(this, void 0, void 0, function* () { return this.client.close(); });
        this.getCollections = () => {
            return {
                appV0: this.db.collection('appV0'),
                appV1: this.db.collection('appV1'),
                appV2: this.db.collection('appV2'),
                appV3: this.db.collection('appV3'),
                appV4: this.db.collection('appV4'),
                appV5: this.db.collection('appV5'),
                appV6: this.db.collection('appV6'),
                appV7: this.db.collection('appV7'),
                appV8: this.db.collection('appV8'),
                appV9: this.db.collection('appV9'),
            };
        };
        this.dropDb = () => __awaiter(this, void 0, void 0, function* () {
            yield this.db.dropDatabase();
        });
        this.dropCollections = () => __awaiter(this, void 0, void 0, function* () {
            const collections = yield this.db.collections();
            yield Promise.all(collections.map((c) => __awaiter(this, void 0, void 0, function* () { return c.drop().catch((e) => e); })));
        });
        this.checkIndexes = () => __awaiter(this, void 0, void 0, function* () {
            yield this.collections.appV1.createIndex({ '_id.key': 1, '_id.date': 1 }, { unique: true });
            yield this.collections.appV2.createIndex({ key: 1, date: 1 }, { unique: true });
            yield this.db
                .createCollection('appV8', {
                storageEngine: {
                    wiredTiger: { configString: 'block_compressor=zstd' },
                },
            })
                .catch(() => { });
            yield this.db
                .createCollection('appV9', {
                timeseries: {
                    timeField: 'date',
                    metaField: 'key',
                    granularity: 'hours',
                },
            })
                .catch(() => { });
        });
        this.client = new mongodb_1.MongoClient('mongodb://localhost:27017', this.options);
        this.db = this.client.db('test');
        this.collections = this.getCollections();
    }
}
exports.default = new Mongo();
