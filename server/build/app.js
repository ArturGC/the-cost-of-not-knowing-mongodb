"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const controllers_1 = require("./controllers");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '50mb' }));
app.use(controllers_1.routes);
exports.default = app;
