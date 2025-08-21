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
export declare class EvaluationService {
    private activeJobs;
    private evaluationQueue;
    private isProcessingQueue;
    startAssessmentEvaluation(studentAssessmentId: number, initiatedBy: number, forceReEvaluation?: boolean): Promise<EvaluationJob>;
    startBatchEvaluation(batchId: number, assessmentId: number, studentAssessments: any[], initiatedBy: number, forceReEvaluation?: boolean): Promise<EvaluationJob>;
    evaluateTask(studentAssessmentId: number, task: AssessmentTask, initiatedBy?: number): Promise<TaskEvaluationResult>;
    evaluateCheck(studentAssessmentId: number, task: AssessmentTask, check: TaskCheck): Promise<CheckResult>;
    executeValidationScript(script: string, credentials: any, provider: string, checkId?: number): Promise<{
        passed: boolean;
        evidence?: string;
        error?: string;
    }>;
    cancelEvaluation(evaluationJobId: number, userId: number): Promise<boolean>;
    retryEvaluation(originalJob: EvaluationJob, userId: number): Promise<EvaluationJob>;
    getEvaluationJobById(jobId: number): Promise<EvaluationJob | null>;
    private processQueue;
    private processEvaluationJob;
    private processAssessmentEvaluation;
    private processBatchEvaluation;
    private markJobFailed;
    private validateAWSResource;
    private validateAzureResource;
    private validateGCPResource;
    private calculateGrade;
    private logEvaluation;
    private getStudentAssessment;
    private getAssessmentTasks;
    private getTaskChecks;
    private getStudentCloudCredentials;
    private createTaskResult;
    private updateTaskResult;
    private saveCheckResult;
    private updateFinalScore;
    private getAssessmentTasksCount;
    private getBatchTasksCount;
    getAssessmentTask(taskId: number): Promise<AssessmentTask>;
    evaluateStudentAssessment(studentAssessmentId: number): Promise<void>;
}
export declare const getLogs: (studentAssessmentId: number) => Promise<{
    timestamp: string;
    message: string;
}[]>;
export declare const evaluationService: EvaluationService;
export {};
//# sourceMappingURL=evaluationService.d.ts.map