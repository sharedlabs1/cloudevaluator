export declare class QuestionService {
    createQuestion(scenario: string, evaluationScript: string, tasks: any[]): Promise<any>;
    validateTask(id: number, taskIndex: number): Promise<{
        question: any;
        task: any;
    }>;
    submitAssessment(id: number): Promise<number>;
    addQuestionToAssessment(assessmentId: string, data: any): Promise<any>;
    getQuestionsForAssessment(assessmentId: string): Promise<any[]>;
    getQuestionDetails(id: string): Promise<any>;
    updateQuestion(id: string, data: any): Promise<any>;
    updateEvaluationScript(id: string, evaluationScript: string): Promise<any>;
    deleteQuestion(id: string): Promise<boolean>;
}
export declare const questionService: QuestionService;
//# sourceMappingURL=questionService.d.ts.map