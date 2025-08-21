"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBatchSchema = exports.createUserSchema = exports.createAssessmentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createAssessmentSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).max(255).required(),
    description: joi_1.default.string().max(1000),
    case_study_content: joi_1.default.string().required(),
    duration_minutes: joi_1.default.number().min(1).max(1440).required(),
    tasks: joi_1.default.array().items(joi_1.default.object({
        title: joi_1.default.string().min(3).max(255).required(),
        description: joi_1.default.string().max(1000),
        instructions: joi_1.default.string().required(),
        cloud_provider: joi_1.default.string().valid('aws', 'azure', 'gcp').required(),
        total_marks: joi_1.default.number().min(1).required(),
        evaluation_script: joi_1.default.string().required(),
        checks: joi_1.default.array().items(joi_1.default.object({
            title: joi_1.default.string().min(3).max(255).required(),
            description: joi_1.default.string().max(500),
            points: joi_1.default.number().min(1).required(),
            validation_script: joi_1.default.string().required()
        })).min(1).required()
    })).min(1).required()
});
exports.createUserSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    username: joi_1.default.string().min(3).max(50).required(),
    password: joi_1.default.string().min(6).max(50),
    role: joi_1.default.string().valid('admin', 'instructor', 'proctor', 'student').required(),
    first_name: joi_1.default.string().min(2).max(50).required(),
    last_name: joi_1.default.string().min(2).max(50).required()
});
exports.createBatchSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(255).required(),
    description: joi_1.default.string().max(1000),
    instructor_id: joi_1.default.number().required(),
    cloud_account_id: joi_1.default.number().required(),
    student_ids: joi_1.default.array().items(joi_1.default.number()).min(1).required()
});
//# sourceMappingURL=validators.js.map