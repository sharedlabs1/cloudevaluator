export declare class AssessmentService {
    createAssessment(data: any): Promise<any>;
    addQuestionToAssessment(assessmentId: string, questionId?: string, scenario?: string, evaluationScript?: string, tasks?: Array<{
        description: string;
        marks: number;
    }>): Promise<any>;
    getAssessments(): Promise<any[]>;
    getAssessmentDetails(id: string): Promise<any>;
    updateAssessment(id: string, data: any): Promise<any>;
    deleteAssessment(id: string): Promise<boolean>;
    allocateAssessment(data: any): Promise<{
        allocated: boolean;
    }>;
    startAssessment(data: any): Promise<{
        started: boolean;
    }>;
    submitAssessment(data: any): Promise<{
        submitted: boolean;
    }>;
    getAssessmentProgress(studentAssessmentId: string): Promise<{
        progress: number;
    }>;
    getAssessmentResults(studentAssessmentId: string): Promise<{
        score: number;
    }>;
}
//# sourceMappingURL=assessmentService.d.ts.map