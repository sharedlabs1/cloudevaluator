import { Request, Response } from 'express';
export declare class EvaluationController {
    startEvaluation(req: Request, res: Response): Promise<void>;
    cancelEvaluation(req: Request, res: Response): Promise<void>;
    retryEvaluation(req: Request, res: Response): Promise<void>;
    getEvaluationLogs(req: Request, res: Response): Promise<void>;
}
export declare const evaluationController: EvaluationController;
export declare const startEvaluation: (req: Request, res: Response) => Promise<void>;
export declare const retryEvaluation: (req: Request, res: Response) => Promise<void>;
export declare const cancelEvaluation: (req: Request, res: Response) => Promise<void>;
export declare const getEvaluationLogs: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=evaluationController.d.ts.map