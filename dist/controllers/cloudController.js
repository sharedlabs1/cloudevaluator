"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCloudAllocation = exports.getCloudAllocations = exports.allocateCloudAccount = exports.testCloudConnection = exports.getCloudAccounts = exports.deleteCloudAccount = exports.updateCloudAccount = exports.createCloudAccount = void 0;
const cloudService_1 = require("../services/cloudService");
const joi_1 = __importDefault(require("joi"));
const cloudService = new cloudService_1.CloudService();
const createCloudAccountSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(255).required(),
    provider: joi_1.default.string().valid('aws', 'azure', 'gcp').required(),
    credentials: joi_1.default.object().required(),
    description: joi_1.default.string().max(1000).optional()
});
const updateCloudAccountSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(255).optional(),
    credentials: joi_1.default.object().optional(),
    description: joi_1.default.string().max(1000).optional(),
    is_active: joi_1.default.boolean().optional()
});
const createCloudAccount = async (req, res) => {
    try {
        const cloudAccount = await cloudService.createCloudAccount(req.body);
        res.status(201).json({ success: true, data: cloudAccount });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.createCloudAccount = createCloudAccount;
const updateCloudAccount = async (req, res) => {
    try {
        const updatedAccount = await cloudService.updateCloudAccount(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedAccount });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.updateCloudAccount = updateCloudAccount;
const deleteCloudAccount = async (req, res) => {
    try {
        await cloudService.deleteCloudAccount(req.params.id);
        res.status(200).json({ success: true, message: 'Cloud account deleted successfully' });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.deleteCloudAccount = deleteCloudAccount;
const getCloudAccounts = async (_req, res) => {
    try {
        const cloudAccounts = await cloudService.getCloudAccounts();
        res.status(200).json({ success: true, data: cloudAccounts });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.getCloudAccounts = getCloudAccounts;
const testCloudConnection = async (req, res) => {
    try {
        const { provider, credentials } = req.body;
        const result = await cloudService.testCloudConnection(provider, credentials);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.testCloudConnection = testCloudConnection;
const allocateCloudAccount = async (req, res) => {
    const { cloudAccountId, assessmentId, batchId } = req.body;
    if (!cloudAccountId || (!assessmentId && !batchId)) {
        return res.status(400).json({ success: false, message: 'cloudAccountId and assessmentId or batchId required' });
    }
    try {
        await cloudService.allocateCloudAccount(cloudAccountId, assessmentId, batchId);
        return res.json({ success: true });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.allocateCloudAccount = allocateCloudAccount;
const getCloudAllocations = async (req, res) => {
    try {
        const allocations = await cloudService.getCloudAllocations();
        res.json({ success: true, data: allocations });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getCloudAllocations = getCloudAllocations;
const removeCloudAllocation = async (req, res) => {
    try {
        const { id } = req.params;
        await cloudService.removeCloudAllocation(id);
        res.status(200).json({ success: true, message: 'Cloud allocation removed successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.removeCloudAllocation = removeCloudAllocation;
//# sourceMappingURL=cloudController.js.map