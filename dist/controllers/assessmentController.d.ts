import { Request, Response } from 'express';
export declare const createAssessment: (req: Request, res: Response) => Promise<void>;
export declare const addQuestionToAssessment: (req: Request, res: Response) => Promise<void>;
export declare const getAssessments: (_req: Request, res: Response) => Promise<void>;
export declare const getAssessmentDetails: (req: Request, res: Response) => Promise<void>;
export declare const updateAssessment: (req: Request, res: Response) => Promise<void>;
export declare const deleteAssessment: (req: Request, res: Response) => Promise<void>;
export declare const allocateAssessment: (req: Request, res: Response) => Promise<void>;
export declare const startAssessment: (req: Request, res: Response) => Promise<void>;
export declare const submitAssessment: (req: Request, res: Response) => Promise<void>;
export declare const getAssessmentProgress: (req: Request, res: Response) => Promise<void>;
export declare const getAssessmentResults: (req: Request, res: Response) => Promise<void>;
export declare const getStudentAssessments: (req: import("express").Request, res: import("express").Response) => void;
//# sourceMappingURL=assessmentController.d.ts.map