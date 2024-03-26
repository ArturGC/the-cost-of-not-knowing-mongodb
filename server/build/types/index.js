"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodySchema = exports.DocDefaultSchema = void 0;
const zod_1 = require("zod");
exports.DocDefaultSchema = zod_1.z.object({
    date: zod_1.z.coerce.date(),
    key: zod_1.z.string(),
    approved: zod_1.z.number().optional(),
    noFunds: zod_1.z.number().optional(),
    pending: zod_1.z.number().optional(),
    rejected: zod_1.z.number().optional(),
});
exports.BodySchema = zod_1.z.array(exports.DocDefaultSchema);
