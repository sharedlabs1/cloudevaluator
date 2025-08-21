"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const assessments_1 = __importDefault(require("./assessments"));
const batches_1 = __importDefault(require("./batches"));
const users_1 = __importDefault(require("./users"));
const cloud_1 = __importDefault(require("./cloud"));
const evaluation_1 = __importDefault(require("./evaluation"));
const report_1 = __importDefault(require("./report"));
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/assessments', assessments_1.default);
router.use('/batches', batches_1.default);
router.use('/users', users_1.default);
router.use('/cloud-accounts', cloud_1.default);
router.use('/evaluation', evaluation_1.default);
router.use('/api/reports', report_1.default);
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map