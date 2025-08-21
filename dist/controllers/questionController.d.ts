import { Request, Response } from 'express';
export declare const createQuestion: (req: Request, res: Response) => Promise<void>;
export declare const updateEvaluationScript: (req: Request, res: Response) => Promise<void>;
export declare class QuestionController {
    private questionService;
    private taskService;
    constructor();
    createQuestion(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    validateTask(req: Request, res: Response): Promise<void>;
    submitAssessment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    addQuestionToAssessment(req: Request, res: Response): Promise<void>;
    getQuestionsForAssessment(req: Request, res: Response): Promise<void>;
    getQuestionDetails(req: Request, res: Response): Promise<void>;
    updateQuestion(req: Request, res: Response): Promise<void>;
    deleteQuestion(req: Request, res: Response): Promise<void>;
}
export declare const questionController: QuestionController;
export declare const addQuestionToAssessment: (req: Request, res: Response) => Promise<void>;
export declare const getQuestionsForAssessment: (req: Request, res: Response) => Promise<void>;
export declare const getQuestionDetails: (req: Request, res: Response) => Promise<void>;
export declare const updateQuestion: (req: Request, res: Response) => Promise<void>;
export declare const deleteQuestion: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=questionController.d.ts.map