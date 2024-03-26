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
const cfgs_1 = require("./cfgs");
const app_1 = __importDefault(require("./app"));
const mdb_1 = __importDefault(require("./mdb"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const cfg = process.env.EXEC_ENV === 'prod' ? cfgs_1.PROD : cfgs_1.TEST;
    yield mdb_1.default.connect({ dbName: cfg.MDB.DB_NAME, uri: cfg.MDB.URI }, cfg.MDB.OPTIONS);
    yield mdb_1.default.checkIndexes();
    app_1.default.listen(cfg.SERVER.PORT, () => console.log('Server Running'));
});
exports.default = main;
