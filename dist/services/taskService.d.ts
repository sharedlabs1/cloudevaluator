export declare class TaskService {
    addTaskToQuestion(questionId: string, data: any): Promise<any>;
    getTasksForQuestion(questionId: string): Promise<any[]>;
    getTaskDetails(id: string): Promise<any>;
    updateTask(id: string, data: any): Promise<any>;
    deleteTask(id: string): Promise<boolean>;
    validateTask(assessmentId: string, questionId: string, taskId: string, studentId: string, submissionData: any): Promise<{
        status: string;
        message: string;
        details: {};
    }>;
}
//# sourceMappingURL=taskService.d.ts.map