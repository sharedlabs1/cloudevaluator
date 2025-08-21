"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCloudSummaryReport = exports.reportController = exports.ReportController = void 0;
const reportService_1 = require("../services/reportService");
const logger_1 = __importDefault(require("../utils/logger"));
const swagger_1 = require("@nestjs/swagger");
let ReportController = class ReportController {
    async generateAssessmentReport(req, res) {
        try {
            const { assessmentId } = req.params;
            const report = await reportService_1.reportService.generateAssessmentReport(parseInt(assessmentId));
            res.status(200).json({
                success: true,
                data: report,
                message: 'Assessment report generated successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Error generating assessment report:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate assessment report',
            });
        }
    }
    async generateBatchReport(req, res) {
        try {
            const { batchId } = req.params;
            const report = await reportService_1.reportService.generateBatchReport(parseInt(batchId));
            res.status(200).json({
                success: true,
                data: report,
                message: 'Batch report generated successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Error generating batch report:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate batch report',
            });
        }
    }
    async exportReport(req, res) {
        try {
            const { reportType, format } = req.query;
            const reportData = await reportService_1.reportService.exportReport(reportType, format);
            res.setHeader('Content-Disposition', `attachment; filename=report.${format}`);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.send(reportData);
        }
        catch (error) {
            logger_1.default.error('Error exporting report:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to export report',
            });
        }
    }
};
exports.ReportController = ReportController;
exports.ReportController = ReportController = __decorate([
    (0, swagger_1.ApiTags)('Reports')
], ReportController);
exports.reportController = new ReportController();
const getCloudSummaryReport = async (req, res) => {
    const data = await reportService_1.reportService.getCloudEvaluationReport();
    res.json({ success: true, data });
};
exports.getCloudSummaryReport = getCloudSummaryReport;
//# sourceMappingURL=reportController.js.map