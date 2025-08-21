"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBatchDetails = exports.removeStudentFromBatch = exports.addStudentsToBatch = exports.createBatch = void 0;
const batchService_1 = require("../services/batchService");
const logger_1 = __importDefault(require("../utils/logger"));
const batchService = new batchService_1.BatchService();
const createBatch = async (req, res) => {
    try {
        const batch = await batchService.createBatch(req.body);
        res.status(201).json({ success: true, data: batch });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.default.error('Error creating batch:', errorMessage);
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.createBatch = createBatch;
const addStudentsToBatch = async (req, res) => {
    try {
        const result = await batchService.addStudentsToBatch(req.params.id, req.body.studentIds);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.default.error('Error adding students to batch:', errorMessage);
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.addStudentsToBatch = addStudentsToBatch;
const removeStudentFromBatch = async (req, res) => {
    try {
        const result = await batchService.removeStudentFromBatch(req.params.id, req.params.student_id);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.default.error('Error removing student from batch:', errorMessage);
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.removeStudentFromBatch = removeStudentFromBatch;
const getBatchDetails = async (req, res) => {
    try {
        const batch = await batchService.getBatchDetails(req.params.id);
        res.status(200).json({ success: true, data: batch });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.default.error('Error fetching batch details:', errorMessage);
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.getBatchDetails = getBatchDetails;
//# sourceMappingURL=batchController.js.map