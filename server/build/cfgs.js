"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROD = exports.TEST = void 0;
exports.TEST = {
    MDB: {
        DB_NAME: 'test',
        OPTIONS: {
            appName: 'API Server TEST',
            ignoreUndefined: true,
            readPreference: 'primary',
            // writeConcern: { journal: true, w: 'majority' },
        },
        URI: 'mongodb://localhost:27018',
    },
    SERVER: {
        PORT: 3000,
    },
};
exports.PROD = {
    MDB: {
        DB_NAME: 'prod',
        OPTIONS: {
            appName: 'API Server PROD',
            ignoreUndefined: true,
            readPreference: 'primary',
            // writeConcern: { journal: true, w: 'majority' },
        },
        // URI: 'mongodb://arturgc:arturgc_123@agc.node.internal.mdbtraining.net/?directConnection=true',
        URI: 'mongodb://localhost:27017',
    },
    SERVER: {
        PORT: 3000,
    },
};
