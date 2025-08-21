// src/services/evaluationService.ts
import { VM } from 'vm2';
import { query } from '../config/database';
// import { cloudService } from './cloudService';
import { socketService } from '../sockets';
import logger from '../utils/logger';
import { AssessmentTask, TaskCheck } from '../types/assessment';

interface EvaluationJob {
  id: number;
  type: 'assessment' | 'task' | 'batch';
  target_id: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  started_at: Date;
  completed_at?: Date;
  error_message?: string;
  initiated_by: number;
  estimatedDuration?: number;
}

interface TaskEvaluationResult {
  earnedScore: number;
  maxScore: number;
  status: 'completed' | 'failed';
  checks: CheckResult[];
  executionTime: number;
  errorMessage?: string;
}

interface CheckResult {
  checkId: number;
  title: string;
  status: 'passed' | 'failed';
  score: number;
  maxScore: number;
  evidence: string;
  errorMessage?: string;
  executionTime: number;
}

export class EvaluationService {
  private activeJobs = new Map<number, AbortController>();
  private evaluationQueue: EvaluationJob[] = [];
  private isProcessingQueue = false;

  async startAssessmentEvaluation(
    studentAssessmentId: number, 
    initiatedBy: number, 
    forceReEvaluation: boolean = false // Optional parameter, not used
  ): Promise<EvaluationJob> {
    try {
      // Create evaluation job record
      const jobResult = await query(`
        INSERT INTO evaluation_jobs (type, target_id, status, initiated_by, started_at)
        VALUES ('assessment', $1, 'pending', $2, NOW())
        RETURNING *
      `, [studentAssessmentId, initiatedBy]);

      const job = jobResult.rows[0];
      
      // Estimate duration based on number of tasks
      const tasksCount = await this.getAssessmentTasksCount(studentAssessmentId);
      job.estimatedDuration = tasksCount * 30; // 30 seconds per task estimate

      // Add to queue
      this.evaluationQueue.push(job);
      this.processQueue();

      logger.info(`Assessment evaluation job created: ${job.id} for assessment: ${studentAssessmentId}`);
      return job;
    } catch (error) {
      logger.error('Error starting assessment evaluation:', error);
      throw error;
    }
  }

  async startBatchEvaluation(
    batchId: number,
    assessmentId: number,
    studentAssessments: any[],
    initiatedBy: number,
    forceReEvaluation: boolean = false
  ): Promise<EvaluationJob> {
    try {
      // Get allocation ID
      const allocationResult = await query(`
        SELECT id FROM assessment_allocations 
        WHERE batch_id = $1 AND assessment_id = $2
      `, [batchId, assessmentId]);

      if (allocationResult.rows.length === 0) {
        throw new Error('Assessment allocation not found');
      }

      const allocationId = allocationResult.rows[0].id;

      // Create batch evaluation job
      const jobResult = await query(`
        INSERT INTO evaluation_jobs (type, target_id, status, initiated_by, started_at)
        VALUES ('batch', $1, 'pending', $2, NOW())
        RETURNING *
      `, [allocationId, initiatedBy]);

      const job = jobResult.rows[0];
      
      // Estimate duration
      const tasksCount = await this.getBatchTasksCount(batchId, assessmentId);
      job.estimatedDuration = studentAssessments.length * tasksCount * 30; // 30 seconds per task per student

      // Store batch details for processing
      job.batchDetails = {
        batchId,
        assessmentId,
        studentAssessments,
        forceReEvaluation
      };

      // Add to queue
      this.evaluationQueue.push(job);
      this.processQueue();

      logger.info(`Batch evaluation job created: ${job.id} for batch: ${batchId}, assessment: ${assessmentId}`);
      return job;
    } catch (error) {
      logger.error('Error starting batch evaluation:', error);
      throw error;
    }
  }

  async evaluateTask(
    studentAssessmentId: number, 
    task: AssessmentTask, 
    initiatedBy?: number // Optional parameter, not used
  ): Promise<TaskEvaluationResult> {
    const startTime = Date.now();
    
    try {
      const checks = await this.getTaskChecks(task.id);
      const checkResults: CheckResult[] = [];
      let totalScore = 0;

      // Create task result record
      const taskResult = await this.createTaskResult(studentAssessmentId, task.id, task.total_marks);

      // Log evaluation start
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

        // Emit real-time update for each check
        socketService.emitToAssessment(studentAssessmentId, 'checkCompleted', {
          taskId: task.id,
          checkId: check.id,
          result: checkResult
        });
      }

      const status = totalScore > 0 ? 'completed' : 'failed';
      await this.updateTaskResult(taskResult.id, totalScore, status);

      const executionTime = Date.now() - startTime;
      const result: TaskEvaluationResult = {
        earnedScore: totalScore,
        maxScore: task.total_marks,
        status,
        checks: checkResults,
        executionTime
      };

      // Emit task completion
      socketService.emitToAssessment(studentAssessmentId, 'taskCompleted', {
        taskId: task.id,
        result
      });

      // Log evaluation completion
      await this.logEvaluation(null, 'info', `Task evaluation completed: ${task.title}`, {
        taskId: task.id,
        score: totalScore,
        maxScore: task.total_marks,
        executionTime
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await this.logEvaluation(null, 'error', `Task evaluation failed: ${task.title}`, {
        taskId: task.id,
        error: (error as Error).message,
        executionTime
      });

      return {
        earnedScore: 0,
        maxScore: task.total_marks,
        status: 'failed',
        checks: [],
        executionTime,
        errorMessage: (error as Error).message
      };
    }
  }

  async evaluateCheck(
    studentAssessmentId: number,
    task: AssessmentTask,
    check: TaskCheck
  ): Promise<CheckResult> {
    const startTime = Date.now();

    try {
      const studentCredentials = await this.getStudentCloudCredentials(studentAssessmentId);
      
      if (!studentCredentials) {
        throw new Error('Student cloud credentials not found');
      }

      const scriptResult = await this.executeValidationScript(
        check.validation_script,
        studentCredentials,
        task.cloud_provider,
        check.id
      );

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
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        checkId: check.id,
        title: check.title,
        status: 'failed',
        score: 0,
        maxScore: check.points,
        evidence: '',
        errorMessage: (error as Error).message,
        executionTime
      };
    }
  }

  async executeValidationScript(
    script: string,
    credentials: any,
    provider: string,
    checkId?: number
  ): Promise<{ passed: boolean; evidence?: string; error?: string }> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve({ passed: false, error: 'Script execution timeout (30 seconds)' });
      }, 30000);

      try {
        const vm = new VM({
          timeout: 29000, // Slightly less than the outer timeout
          sandbox: {
            credentials,
            provider,
            console: {
              log: (...args: any[]) => {
                const message = args.join(' ');
                this.logEvaluation(null, 'info', `Script output: ${message}`, { checkId });
              },
              error: (...args: any[]) => {
                const message = args.join(' ');
                this.logEvaluation(null, 'error', `Script error: ${message}`, { checkId });
              }
            },
            require: (module: string) => {
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
            // Helper functions for common cloud operations
            validateAWSResource: this.validateAWSResource.bind(this),
            validateAzureResource: this.validateAzureResource.bind(this),
            validateGCPResource: this.validateGCPResource.bind(this),
            sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, Math.min(ms, 5000))), // Max 5 second sleep
            fetch: require('node-fetch') // For API calls
          }
        });

        // Wrap script in async function to handle promises
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

        // Handle async result
        if (result && typeof result.then === 'function') {
          result.then((res: any) => {
            clearTimeout(timeoutId);
            resolve(res || { passed: false, error: 'No result returned' });
          }).catch((error: Error) => {
            clearTimeout(timeoutId);
            resolve({ passed: false, error: (error as Error).message });
          });
        } else {
          clearTimeout(timeoutId);
          resolve(result || { passed: false, error: 'No result returned' });
        }
      } catch (error) {
        clearTimeout(timeoutId);
        resolve({ passed: false, error: (error as Error).message });
      }
    });
  }

  async cancelEvaluation(evaluationJobId: number, userId: number): Promise<boolean> {
    try {
      // Update job status
      await query(`
        UPDATE evaluation_jobs 
        SET status = 'cancelled', completed_at = NOW(), error_message = 'Cancelled by user'
        WHERE id = $1 AND status IN ('pending', 'running')
      `, [evaluationJobId]);

      // Cancel active execution if running
      const abortController = this.activeJobs.get(evaluationJobId);
      if (abortController) {
        abortController.abort();
        this.activeJobs.delete(evaluationJobId);
      }

      // Remove from queue if pending
      this.evaluationQueue = this.evaluationQueue.filter(job => job.id !== evaluationJobId);

      logger.info(`Evaluation cancelled: ${evaluationJobId} by user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error cancelling evaluation:', error);
      return false;
    }
  }

  async retryEvaluation(originalJob: EvaluationJob, userId: number): Promise<EvaluationJob> {
    try {
      // Create new evaluation job
      const newJobResult = await query(`
        INSERT INTO evaluation_jobs (type, target_id, status, initiated_by, started_at)
        VALUES ($1, $2, 'pending', $3, NOW())
        RETURNING *
      `, [originalJob.type, originalJob.target_id, userId]);

      const newJob = newJobResult.rows[0];

      // Copy batch details if it's a batch job
      if (originalJob.type === 'batch' && (originalJob as any).batchDetails) {
        (newJob as any).batchDetails = (originalJob as any).batchDetails;
      }

      // Add to queue
      this.evaluationQueue.push(newJob);
      this.processQueue();

      logger.info(`Evaluation retry started: ${newJob.id} (original: ${originalJob.id})`);
      return newJob;
    } catch (error) {
      logger.error('Error retrying evaluation:', error);
      throw error;
    }
  }

  async getEvaluationJobById(jobId: number): Promise<EvaluationJob | null> {
    try {
      const result = await query(
        `SELECT * FROM evaluation_jobs WHERE id = $1`,
        [jobId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0] as EvaluationJob;
    } catch (error) {
      logger.error('Error fetching evaluation job by ID:', error);
      throw error;
    }
  }

  // Queue processing
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.evaluationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.evaluationQueue.length > 0) {
      const job = this.evaluationQueue.shift()!;
      
      try {
        await this.processEvaluationJob(job);
      } catch (error) {
        logger.error(`Error processing evaluation job ${job.id}:`, error);
        await this.markJobFailed(job.id, (error as Error).message);
      }
    }

    this.isProcessingQueue = false;
  }

  private async processEvaluationJob(job: EvaluationJob): Promise<void> {
    const abortController = new AbortController();
    this.activeJobs.set(job.id, abortController);

    try {
      // Mark job as running
      await query(`
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

      // Mark job as completed
      await query(`
        UPDATE evaluation_jobs 
        SET status = 'completed', completed_at = NOW(), progress = 100
        WHERE id = $1
      `, [job.id]);

      logger.info(`Evaluation job completed: ${job.id}`);
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        logger.info(`Evaluation job cancelled: ${job.id}`);
      } else {
        await this.markJobFailed(job.id, (error as Error).message);
      }
    } finally {
      this.activeJobs.delete(job.id);
    }
  }

  private async processAssessmentEvaluation(job: EvaluationJob, signal: AbortSignal): Promise<void> {
    const studentAssessmentId = job.target_id;
    
    // Get assessment and tasks
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

      // Update progress
      const progress = Math.round((completedTasks / tasks.length) * 100);
      await query(`
        UPDATE evaluation_jobs 
        SET progress = $2
        WHERE id = $1
      `, [job.id, progress]);

      // Emit progress update
      socketService.emitToAssessment(studentAssessmentId, 'evaluationProgress', {
        jobId: job.id,
        progress,
        completedTasks,
        totalTasks: tasks.length
      });
    }

    // Calculate final score and grade
    const percentage = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;
    const grade = this.calculateGrade(percentage);

    await this.updateFinalScore(studentAssessmentId, totalScore, percentage, grade);

    // Emit completion event
    socketService.emitToAssessment(studentAssessmentId, 'evaluationCompleted', {
      jobId: job.id,
      totalScore,
      percentage,
      grade,
      status: 'completed'
    });
  }

  private async processBatchEvaluation(job: EvaluationJob, signal: AbortSignal): Promise<void> {
    const { studentAssessments } = (job as any).batchDetails;
    let completedAssessments = 0;

    for (const studentAssessment of studentAssessments) {
      if (signal.aborted) {
        throw new Error('Evaluation cancelled');
      }

      try {
        await this.evaluateStudentAssessment(studentAssessment.id);
        completedAssessments++;

        // Update progress
        const progress = Math.round((completedAssessments / studentAssessments.length) * 100);
        await query(`
          UPDATE evaluation_jobs 
          SET progress = $2
          WHERE id = $1
        `, [job.id, progress]);

        // Emit progress update
        socketService.emitToMonitoring('batchEvaluationProgress', {
          jobId: job.id,
          progress,
          completedAssessments,
          totalAssessments: studentAssessments.length,
          currentStudent: studentAssessment
        });
      } catch (error) {
        logger.error(`Error evaluating student assessment ${studentAssessment.id}:`, error);
        // Continue with other students
      }
    }
  }

  private async markJobFailed(jobId: number, errorMessage: string): Promise<void> {
    await query(`
      UPDATE evaluation_jobs 
      SET status = 'failed', completed_at = NOW(), error_message = $2
      WHERE id = $1
    `, [jobId, errorMessage]);
  }

  // Helper methods for cloud resource validation
  private async validateAWSResource(credentials: any, resourceType: string, resourceName: string): Promise<any> {
    // Implementation for AWS resource validation
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
    } catch (error) {
      return { exists: false, error: (error as Error).message };
    }
  }

  private async validateAzureResource(credentials: any, resourceType: string): Promise<any> {
    // Implementation for Azure resource validation
    try {
      const { ClientSecretCredential } = require('@azure/identity');
      const credential = new ClientSecretCredential(
        credentials.tenant_id,
        credentials.access_key,
        credentials.secret_key
      );

      switch (resourceType.toLowerCase()) {
        case 'storage':
        case 'storageaccount':
          const { StorageManagementClient } = require('@azure/arm-storage');
          // const storageClient = new StorageManagementClient(credential, credentials.subscription_id);
          
          // This is a simplified example - you'd need to implement proper resource checking
          return { exists: true, details: 'Azure validation placeholder' };
          
        default:
          throw new Error(`Unsupported Azure resource type: ${resourceType}`);
      }
    } catch (error) {
      return { exists: false, error: (error as Error).message };
    }
  }

  private async validateGCPResource(credentials: any, resourceType: string, resourceName: string): Promise<any> {
    // Implementation for GCP resource validation
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
    } catch (error) {
      return { exists: false, error: (error as Error).message };
    }
  }

  // Utility methods
  private calculateGrade(percentage: number): string {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 65) return 'D';
    return 'F';
  }

  private async logEvaluation(
    jobId: number | null, 
    level: 'info' | 'warn' | 'error', 
    message: string, 
    details?: any
  ): Promise<void> {
    try {
      if (jobId) {
        await query(`
          INSERT INTO evaluation_logs (evaluation_job_id, level, message, details, created_at)
          VALUES ($1, $2, $3, $4, NOW())
        `, [jobId, level, message, JSON.stringify(details || {})]);
      }
      
      // Also log to application logger
      logger[level](`Evaluation: ${message}`, details);
    } catch (error) {
      logger.error('Error logging evaluation:', error);
    }
  }

  // Database helper methods
  private async getStudentAssessment(studentAssessmentId: number): Promise<any> {
    const result = await query(`
      SELECT sa.*, a.id as assessment_id, a.title, a.total_marks
      FROM student_assessments sa
      JOIN assessment_allocations aa ON sa.allocation_id = aa.id
      JOIN assessments a ON aa.assessment_id = a.id
      WHERE sa.id = $1
    `, [studentAssessmentId]);
    
    return result.rows[0];
  }

  private async getAssessmentTasks(assessmentId: number): Promise<AssessmentTask[]> {
    const result = await query(`
      SELECT * FROM assessment_tasks 
      WHERE assessment_id = $1 
      ORDER BY task_number
    `, [assessmentId]);
    
    return result.rows;
  }

  private async getTaskChecks(taskId: number): Promise<TaskCheck[]> {
    const result = await query(`
      SELECT * FROM task_checks 
      WHERE task_id = $1 
      ORDER BY check_number
    `, [taskId]);
    
    return result.rows;
  }

  private async getStudentCloudCredentials(studentAssessmentId: number): Promise<any> {
    const result = await query(`
      SELECT cloud_user_credentials 
      FROM student_assessments 
      WHERE id = $1
    `, [studentAssessmentId]);
    
    return result.rows[0]?.cloud_user_credentials;
  }

  private async createTaskResult(studentAssessmentId: number, taskId: number, maxScore: number): Promise<any> {
    const result = await query(`
      INSERT INTO task_results (student_assessment_id, task_id, max_score)
      VALUES ($1, $2, $3)
      ON CONFLICT (student_assessment_id, task_id) 
      DO UPDATE SET max_score = $3, completed_at = NULL, status = 'pending'
      RETURNING *
    `, [studentAssessmentId, taskId, maxScore]);
    
    return result.rows[0];
  }

  private async updateTaskResult(taskResultId: number, score: number, status: string): Promise<void> {
    await query(`
      UPDATE task_results 
      SET score = $2, status = $3, completed_at = NOW()
      WHERE id = $1
    `, [taskResultId, score, status]);
  }

  private async saveCheckResult(
    taskResultId: number,
    checkId: number,
    result: CheckResult
  ): Promise<void> {
    await query(`
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

  private async updateFinalScore(
    studentAssessmentId: number,
    totalScore: number,
    percentage: number,
    grade: string
  ): Promise<void> {
    await query(`
      UPDATE student_assessments 
      SET total_score = $2, percentage = $3, grade = $4
      WHERE id = $1
    `, [studentAssessmentId, totalScore, percentage, grade]);
  }

  private async getAssessmentTasksCount(studentAssessmentId: number): Promise<number> {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM assessment_tasks at
      JOIN assessment_allocations aa ON at.assessment_id = aa.assessment_id
      JOIN student_assessments sa ON aa.id = sa.allocation_id
      WHERE sa.id = $1
    `, [studentAssessmentId]);
    
    return parseInt(result.rows[0].count);
  }

  private async getBatchTasksCount(_: number, assessmentId: number): Promise<number> {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM assessment_tasks 
      WHERE assessment_id = $1
    `, [assessmentId]);
    
    return parseInt(result.rows[0].count);
  }

  async getAssessmentTask(taskId: number): Promise<AssessmentTask> {
    const result = await query(`
      SELECT * FROM assessment_tasks
      WHERE id = $1
    `, [taskId]);

    if (result.rows.length === 0) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    return result.rows[0] as AssessmentTask;
  }

  // Main evaluation method (existing)
  async evaluateStudentAssessment(studentAssessmentId: number): Promise<void> {
    // This is the main method that orchestrates the entire assessment evaluation
    // It calls the processAssessmentEvaluation method
    const job: EvaluationJob = {
      id: 0, // Temporary ID for direct evaluation
      type: 'assessment',
      target_id: studentAssessmentId,
      status: 'running',
      progress: 0,
      started_at: new Date(),
      initiated_by: 0 // System initiated
    };

    await this.processAssessmentEvaluation(job, new AbortController().signal);
  }
}

// Add a method to fetch evaluation logs
export const getLogs = async (studentAssessmentId: number) => {
  // Mock implementation, replace with actual log retrieval logic
  return [
    { timestamp: '2025-08-20T10:00:00Z', message: 'Evaluation started' },
    { timestamp: '2025-08-20T10:05:00Z', message: 'Task 1 completed' },
  ];
};

export const evaluationService = new EvaluationService();