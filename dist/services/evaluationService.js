"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationService = exports.getLogs = exports.EvaluationService = void 0;
const vm2_1 = require("vm2");
const database_1 = require("../config/database");
const sockets_1 = require("../sockets");
const logger_1 = __importDefault(require("../utils/logger"));
class EvaluationService {
    constructor() {
        this.activeJobs = new Map();
        this.evaluationQueue = [];
        this.isProcessingQueue = false;
    }
    async startAssessmentEvaluation(studentAssessmentId, initiatedBy, forceReEvaluation = false) {
        try {
            const jobResult = await (0, database_1.query)(`
        INSERT INTO evaluation_jobs (type, target_id, status, initiated_by, started_at)
        VALUES ('assessment', $1, 'pending', $2, NOW())
        RETURNING *
      `, [studentAssessmentId, initiatedBy]);
            const job = jobResult.rows[0];
            const tasksCount = await this.getAssessmentTasksCount(studentAssessmentId);
            job.estimatedDuration = tasksCount * 30;
            this.evaluationQueue.push(job);
            this.processQueue();
            logger_1.default.info(`Assessment evaluation job created: ${job.id} for assessment: ${studentAssessmentId}`);
            return job;
        }
        catch (error) {
            logger_1.default.error('Error starting assessment evaluation:', error);
            throw error;
        }
    }
    async startBatchEvaluation(batchId, assessmentId, studentAssessments, initiatedBy, forceReEvaluation = false) {
        try {
            const allocationResult = await (0, database_1.query)(`
        SELECT id FROM assessment_allocations 
        WHERE batch_id = $1 AND assessment_id = $2
      `, [batchId, assessmentId]);
            if (allocationResult.rows.length === 0) {
                throw new Error('Assessment allocation not found');
            }
            const allocationId = allocationResult.rows[0].id;
            const jobResult = await (0, database_1.query)(`
        INSERT INTO evaluation_jobs (type, target_id, status, initiated_by, started_at)
        VALUES ('batch', $1, 'pending', $2, NOW())
        RETURNING *
      `, [allocationId, initiatedBy]);
            const job = jobResult.rows[0];
            const tasksCount = await this.getBatchTasksCount(batchId, assessmentId);
            job.estimatedDuration = studentAssessments.length * tasksCount * 30;
            job.batchDetails = {
                batchId,
                assessmentId,
                studentAssessments,
                forceReEvaluation
            };
            this.evaluationQueue.push(job);
            this.processQueue();
            logger_1.default.info(`Batch evaluation job created: ${job.id} for batch: ${batchId}, assessment: ${assessmentId}`);
            return job;
        }
        catch (error) {
            logger_1.default.error('Error starting batch evaluation:', error);
            throw error;
        }
    }
    async evaluateTask(studentAssessmentId, task, initiatedBy) {
        const startTime = Date.now();
        try {
            const checks = await this.getTaskChecks(task.id);
            const checkResults = [];
            let totalScore = 0;
            const taskResult = await this.createTaskResult(studentAssessmentId, task.id, task.total_marks);
            await this.logEvaluation(null, 'info', `Starting task evaluation: ${task.title}`, {
                taskId: task.id,
                studentAssessmentId,
                checksCount: checks.length
            });
            for (const check of checks) {
                const checkResult = await this.evaluateCheck(studentAssessmentId, task, check);
                checkResults.push(checkResult);
                totalScore += checkResult.score;
                await this.saveCheckResult(taskResult.id, check.id, checkResult);
                sockets_1.socketService.emitToAssessment(studentAssessmentId, 'checkCompleted', {
                    taskId: task.id,
                    checkId: check.id,
                    result: checkResult
                });
            }
            const status = totalScore > 0 ? 'completed' : 'failed';
            await this.updateTaskResult(taskResult.id, totalScore, status);
            const executionTime = Date.now() - startTime;
            const result = {
                earnedScore: totalScore,
                maxScore: task.total_marks,
                status,
                checks: checkResults,
                executionTime
            };
            sockets_1.socketService.emitToAssessment(studentAssessmentId, 'taskCompleted', {
                taskId: task.id,
                result
            });
            await this.logEvaluation(null, 'info', `Task evaluation completed: ${task.title}`, {
                taskId: task.id,
                score: totalScore,
                maxScore: task.total_marks,
                executionTime
            });
            return result;
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            await this.logEvaluation(null, 'error', `Task evaluation failed: ${task.title}`, {
                taskId: task.id,
                error: error.message,
                executionTime
            });
            return {
                earnedScore: 0,
                maxScore: task.total_marks,
                status: 'failed',
                checks: [],
                executionTime,
                errorMessage: error.message
            };
        }
    }
    async evaluateCheck(studentAssessmentId, task, check) {
        const startTime = Date.now();
        try {
            const studentCredentials = await this.getStudentCloudCredentials(studentAssessmentId);
            if (!studentCredentials) {
                throw new Error('Student cloud credentials not found');
            }
            const scriptResult = await this.executeValidationScript(check.validation_script, studentCredentials, task.cloud_provider, check.id);
            const executionTime = Date.now() - startTime;
            return {
                checkId: check.id,
                title: check.title,
                status: scriptResult.passed ? 'passed' : 'failed',
                score: scriptResult.passed ? check.points : 0,
                maxScore: check.points,
                evidence: scriptResult.evidence || '',
                errorMessage: scriptResult.error,
                executionTime
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                checkId: check.id,
                title: check.title,
                status: 'failed',
                score: 0,
                maxScore: check.points,
                evidence: '',
                errorMessage: error.message,
                executionTime
            };
        }
    }
    async executeValidationScript(script, credentials, provider, checkId) {
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
                resolve({ passed: false, error: 'Script execution timeout (30 seconds)' });
            }, 30000);
            try {
                const vm = new vm2_1.VM({
                    timeout: 29000,
                    sandbox: {
                        credentials,
                        provider,
                        console: {
                            log: (...args) => {
                                const message = args.join(' ');
                                this.logEvaluation(null, 'info', `Script output: ${message}`, { checkId });
                            },
                            error: (...args) => {
                                const message = args.join(' ');
                                this.logEvaluation(null, 'error', `Script error: ${message}`, { checkId });
                            }
                        },
                        require: (module) => {
                            const allowedModules = [
                                'aws-sdk',
                                '@azure/arm-storage',
                                '@azure/arm-compute',
                                '@azure/identity',
                                '@google-cloud/storage',
                                '@google-cloud/compute',
                                'googleapis'
                            ];
                            if (allowedModules.includes(module)) {
                                return require(module);
                            }
                            throw new Error(`Module ${module} is not allowed`);
                        },
                        validateAWSResource: this.validateAWSResource.bind(this),
                        validateAzureResource: this.validateAzureResource.bind(this),
                        validateGCPResource: this.validateGCPResource.bind(this),
                        sleep: (ms) => new Promise(resolve => setTimeout(resolve, Math.min(ms, 5000))),
                        fetch: require('node-fetch')
                    }
                });
                const wrappedScript = `
          (async () => {
            try {
              ${script}
            } catch (error) {
              return { passed: false, error: (error as Error).message };
            }
          })()
        `;
                const result = vm.run(wrappedScript);
                if (result && typeof result.then === 'function') {
                    result.then((res) => {
                        clearTimeout(timeoutId);
                        resolve(res || { passed: false, error: 'No result returned' });
                    }).catch((error) => {
                        clearTimeout(timeoutId);
                        resolve({ passed: false, error: error.message });
                    });
                }
                else {
                    clearTimeout(timeoutId);
                    resolve(result || { passed: false, error: 'No result returned' });
                }
            }
            catch (error) {
                clearTimeout(timeoutId);
                resolve({ passed: false, error: error.message });
            }
        });
    }
    async cancelEvaluation(evaluationJobId, userId) {
        try {
            await (0, database_1.query)(`
        UPDATE evaluation_jobs 
        SET status = 'cancelled', completed_at = NOW(), error_message = 'Cancelled by user'
        WHERE id = $1 AND status IN ('pending', 'running')
      `, [evaluationJobId]);
            const abortController = this.activeJobs.get(evaluationJobId);
            if (abortController) {
                abortController.abort();
                this.activeJobs.delete(evaluationJobId);
            }
            this.evaluationQueue = this.evaluationQueue.filter(job => job.id !== evaluationJobId);
            logger_1.default.info(`Evaluation cancelled: ${evaluationJobId} by user: ${userId}`);
            return true;
        }
        catch (error) {
            logger_1.default.error('Error cancelling evaluation:', error);
            return false;
        }
    }
    async retryEvaluation(originalJob, userId) {
        try {
            const newJobResult = await (0, database_1.query)(`
        INSERT INTO evaluation_jobs (type, target_id, status, initiated_by, started_at)
        VALUES ($1, $2, 'pending', $3, NOW())
        RETURNING *
      `, [originalJob.type, originalJob.target_id, userId]);
            const newJob = newJobResult.rows[0];
            if (originalJob.type === 'batch' && originalJob.batchDetails) {
                newJob.batchDetails = originalJob.batchDetails;
            }
            this.evaluationQueue.push(newJob);
            this.processQueue();
            logger_1.default.info(`Evaluation retry started: ${newJob.id} (original: ${originalJob.id})`);
            return newJob;
        }
        catch (error) {
            logger_1.default.error('Error retrying evaluation:', error);
            throw error;
        }
    }
    async getEvaluationJobById(jobId) {
        try {
            const result = await (0, database_1.query)(`SELECT * FROM evaluation_jobs WHERE id = $1`, [jobId]);
            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0];
        }
        catch (error) {
            logger_1.default.error('Error fetching evaluation job by ID:', error);
            throw error;
        }
    }
    async processQueue() {
        if (this.isProcessingQueue || this.evaluationQueue.length === 0) {
            return;
        }
        this.isProcessingQueue = true;
        while (this.evaluationQueue.length > 0) {
            const job = this.evaluationQueue.shift();
            try {
                await this.processEvaluationJob(job);
            }
            catch (error) {
                logger_1.default.error(`Error processing evaluation job ${job.id}:`, error);
                await this.markJobFailed(job.id, error.message);
            }
        }
        this.isProcessingQueue = false;
    }
    async processEvaluationJob(job) {
        const abortController = new AbortController();
        this.activeJobs.set(job.id, abortController);
        try {
            await (0, database_1.query)(`
        UPDATE evaluation_jobs 
        SET status = 'running', progress = 0
        WHERE id = $1
      `, [job.id]);
            switch (job.type) {
                case 'assessment':
                    await this.processAssessmentEvaluation(job, abortController.signal);
                    break;
                case 'batch':
                    await this.processBatchEvaluation(job, abortController.signal);
                    break;
                default:
                    throw new Error(`Unknown job type: ${job.type}`);
            }
            await (0, database_1.query)(`
        UPDATE evaluation_jobs 
        SET status = 'completed', completed_at = NOW(), progress = 100
        WHERE id = $1
      `, [job.id]);
            logger_1.default.info(`Evaluation job completed: ${job.id}`);
        }
        catch (error) {
            if (error.name === 'AbortError') {
                logger_1.default.info(`Evaluation job cancelled: ${job.id}`);
            }
            else {
                await this.markJobFailed(job.id, error.message);
            }
        }
        finally {
            this.activeJobs.delete(job.id);
        }
    }
    async processAssessmentEvaluation(job, signal) {
        const studentAssessmentId = job.target_id;
        const assessment = await this.getStudentAssessment(studentAssessmentId);
        const tasks = await this.getAssessmentTasks(assessment.assessment_id);
        let completedTasks = 0;
        let totalScore = 0;
        let totalPossibleScore = 0;
        for (const task of tasks) {
            if (signal.aborted) {
                throw new Error('Evaluation cancelled');
            }
            const taskResult = await this.evaluateTask(studentAssessmentId, task);
            totalScore += taskResult.earnedScore;
            totalPossibleScore += taskResult.maxScore;
            completedTasks++;
            const progress = Math.round((completedTasks / tasks.length) * 100);
            await (0, database_1.query)(`
        UPDATE evaluation_jobs 
        SET progress = $2
        WHERE id = $1
      `, [job.id, progress]);
            sockets_1.socketService.emitToAssessment(studentAssessmentId, 'evaluationProgress', {
                jobId: job.id,
                progress,
                completedTasks,
                totalTasks: tasks.length
            });
        }
        const percentage = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;
        const grade = this.calculateGrade(percentage);
        await this.updateFinalScore(studentAssessmentId, totalScore, percentage, grade);
        sockets_1.socketService.emitToAssessment(studentAssessmentId, 'evaluationCompleted', {
            jobId: job.id,
            totalScore,
            percentage,
            grade,
            status: 'completed'
        });
    }
    async processBatchEvaluation(job, signal) {
        const { studentAssessments } = job.batchDetails;
        let completedAssessments = 0;
        for (const studentAssessment of studentAssessments) {
            if (signal.aborted) {
                throw new Error('Evaluation cancelled');
            }
            try {
                await this.evaluateStudentAssessment(studentAssessment.id);
                completedAssessments++;
                const progress = Math.round((completedAssessments / studentAssessments.length) * 100);
                await (0, database_1.query)(`
          UPDATE evaluation_jobs 
          SET progress = $2
          WHERE id = $1
        `, [job.id, progress]);
                sockets_1.socketService.emitToMonitoring('batchEvaluationProgress', {
                    jobId: job.id,
                    progress,
                    completedAssessments,
                    totalAssessments: studentAssessments.length,
                    currentStudent: studentAssessment
                });
            }
            catch (error) {
                logger_1.default.error(`Error evaluating student assessment ${studentAssessment.id}:`, error);
            }
        }
    }
    async markJobFailed(jobId, errorMessage) {
        await (0, database_1.query)(`
      UPDATE evaluation_jobs 
      SET status = 'failed', completed_at = NOW(), error_message = $2
      WHERE id = $1
    `, [jobId, errorMessage]);
    }
    async validateAWSResource(credentials, resourceType, resourceName) {
        const AWS = require('aws-sdk');
        try {
            switch (resourceType.toLowerCase()) {
                case 's3':
                case 'bucket':
                    const s3 = new AWS.S3({
                        accessKeyId: credentials.access_key,
                        secretAccessKey: credentials.secret_key,
                        region: credentials.region
                    });
                    const bucketExists = await s3.headBucket({ Bucket: resourceName }).promise();
                    return { exists: true, details: bucketExists };
                case 'ec2':
                case 'instance':
                    const ec2 = new AWS.EC2({
                        accessKeyId: credentials.access_key,
                        secretAccessKey: credentials.secret_key,
                        region: credentials.region
                    });
                    const instances = await ec2.describeInstances({
                        InstanceIds: [resourceName]
                    }).promise();
                    return { exists: instances.Reservations.length > 0, details: instances };
                default:
                    throw new Error(`Unsupported AWS resource type: ${resourceType}`);
            }
        }
        catch (error) {
            return { exists: false, error: error.message };
        }
    }
    async validateAzureResource(credentials, resourceType) {
        try {
            const { ClientSecretCredential } = require('@azure/identity');
            const credential = new ClientSecretCredential(credentials.tenant_id, credentials.access_key, credentials.secret_key);
            switch (resourceType.toLowerCase()) {
                case 'storage':
                case 'storageaccount':
                    const { StorageManagementClient } = require('@azure/arm-storage');
                    return { exists: true, details: 'Azure validation placeholder' };
                default:
                    throw new Error(`Unsupported Azure resource type: ${resourceType}`);
            }
        }
        catch (error) {
            return { exists: false, error: error.message };
        }
    }
    async validateGCPResource(credentials, resourceType, resourceName) {
        try {
            const { GoogleAuth } = require('google-auth-library');
            const auth = new GoogleAuth({
                credentials: JSON.parse(credentials.access_key),
                scopes: ['https://www.googleapis.com/auth/cloud-platform']
            });
            switch (resourceType.toLowerCase()) {
                case 'storage':
                case 'bucket':
                    const { Storage } = require('@google-cloud/storage');
                    const storage = new Storage({ auth });
                    const [exists] = await storage.bucket(resourceName).exists();
                    return { exists, details: exists ? 'Bucket exists' : 'Bucket not found' };
                default:
                    throw new Error(`Unsupported GCP resource type: ${resourceType}`);
            }
        }
        catch (error) {
            return { exists: false, error: error.message };
        }
    }
    calculateGrade(percentage) {
        if (percentage >= 97)
            return 'A+';
        if (percentage >= 93)
            return 'A';
        if (percentage >= 90)
            return 'A-';
        if (percentage >= 87)
            return 'B+';
        if (percentage >= 83)
            return 'B';
        if (percentage >= 80)
            return 'B-';
        if (percentage >= 77)
            return 'C+';
        if (percentage >= 73)
            return 'C';
        if (percentage >= 70)
            return 'C-';
        if (percentage >= 67)
            return 'D+';
        if (percentage >= 65)
            return 'D';
        return 'F';
    }
    async logEvaluation(jobId, level, message, details) {
        try {
            if (jobId) {
                await (0, database_1.query)(`
          INSERT INTO evaluation_logs (evaluation_job_id, level, message, details, created_at)
          VALUES ($1, $2, $3, $4, NOW())
        `, [jobId, level, message, JSON.stringify(details || {})]);
            }
            logger_1.default[level](`Evaluation: ${message}`, details);
        }
        catch (error) {
            logger_1.default.error('Error logging evaluation:', error);
        }
    }
    async getStudentAssessment(studentAssessmentId) {
        const result = await (0, database_1.query)(`
      SELECT sa.*, a.id as assessment_id, a.title, a.total_marks
      FROM student_assessments sa
      JOIN assessment_allocations aa ON sa.allocation_id = aa.id
      JOIN assessments a ON aa.assessment_id = a.id
      WHERE sa.id = $1
    `, [studentAssessmentId]);
        return result.rows[0];
    }
    async getAssessmentTasks(assessmentId) {
        const result = await (0, database_1.query)(`
      SELECT * FROM assessment_tasks 
      WHERE assessment_id = $1 
      ORDER BY task_number
    `, [assessmentId]);
        return result.rows;
    }
    async getTaskChecks(taskId) {
        const result = await (0, database_1.query)(`
      SELECT * FROM task_checks 
      WHERE task_id = $1 
      ORDER BY check_number
    `, [taskId]);
        return result.rows;
    }
    async getStudentCloudCredentials(studentAssessmentId) {
        const result = await (0, database_1.query)(`
      SELECT cloud_user_credentials 
      FROM student_assessments 
      WHERE id = $1
    `, [studentAssessmentId]);
        return result.rows[0]?.cloud_user_credentials;
    }
    async createTaskResult(studentAssessmentId, taskId, maxScore) {
        const result = await (0, database_1.query)(`
      INSERT INTO task_results (student_assessment_id, task_id, max_score)
      VALUES ($1, $2, $3)
      ON CONFLICT (student_assessment_id, task_id) 
      DO UPDATE SET max_score = $3, completed_at = NULL, status = 'pending'
      RETURNING *
    `, [studentAssessmentId, taskId, maxScore]);
        return result.rows[0];
    }
    async updateTaskResult(taskResultId, score, status) {
        await (0, database_1.query)(`
      UPDATE task_results 
      SET score = $2, status = $3, completed_at = NOW()
      WHERE id = $1
    `, [taskResultId, score, status]);
    }
    async saveCheckResult(taskResultId, checkId, result) {
        await (0, database_1.query)(`
      INSERT INTO check_results 
      (task_result_id, check_id, status, score, max_score, evidence, error_message, evaluated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (task_result_id, check_id)
      DO UPDATE SET 
        status = $3, score = $4, evidence = $6, error_message = $7, evaluated_at = NOW()
    `, [
            taskResultId,
            checkId,
            result.status,
            result.score,
            result.maxScore,
            result.evidence,
            result.errorMessage
        ]);
    }
    async updateFinalScore(studentAssessmentId, totalScore, percentage, grade) {
        await (0, database_1.query)(`
      UPDATE student_assessments 
      SET total_score = $2, percentage = $3, grade = $4
      WHERE id = $1
    `, [studentAssessmentId, totalScore, percentage, grade]);
    }
    async getAssessmentTasksCount(studentAssessmentId) {
        const result = await (0, database_1.query)(`
      SELECT COUNT(*) as count
      FROM assessment_tasks at
      JOIN assessment_allocations aa ON at.assessment_id = aa.assessment_id
      JOIN student_assessments sa ON aa.id = sa.allocation_id
      WHERE sa.id = $1
    `, [studentAssessmentId]);
        return parseInt(result.rows[0].count);
    }
    async getBatchTasksCount(_, assessmentId) {
        const result = await (0, database_1.query)(`
      SELECT COUNT(*) as count
      FROM assessment_tasks 
      WHERE assessment_id = $1
    `, [assessmentId]);
        return parseInt(result.rows[0].count);
    }
    async getAssessmentTask(taskId) {
        const result = await (0, database_1.query)(`
      SELECT * FROM assessment_tasks
      WHERE id = $1
    `, [taskId]);
        if (result.rows.length === 0) {
            throw new Error(`Task with ID ${taskId} not found`);
        }
        return result.rows[0];
    }
    async evaluateStudentAssessment(studentAssessmentId) {
        const job = {
            id: 0,
            type: 'assessment',
            target_id: studentAssessmentId,
            status: 'running',
            progress: 0,
            started_at: new Date(),
            initiated_by: 0
        };
        await this.processAssessmentEvaluation(job, new AbortController().signal);
    }
}
exports.EvaluationService = EvaluationService;
const getLogs = async (studentAssessmentId) => {
    return [
        { timestamp: '2025-08-20T10:00:00Z', message: 'Evaluation started' },
        { timestamp: '2025-08-20T10:05:00Z', message: 'Task 1 completed' },
    ];
};
exports.getLogs = getLogs;
exports.evaluationService = new EvaluationService();
//# sourceMappingURL=evaluationService.js.map