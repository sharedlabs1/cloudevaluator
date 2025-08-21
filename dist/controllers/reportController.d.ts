import { Request, Response } from 'express';
export declare class ReportController {
    generateAssessmentReport(req: Request, res: Response): Promise<void>;
    generateBatchReport(req: Request, res: Response): Promise<void>;
    exportReport(req: Request, res: Response): Promise<void>;
}
export declare const reportController: ReportController;
export declare const getCloudSummaryReport: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=reportController.d.ts.map