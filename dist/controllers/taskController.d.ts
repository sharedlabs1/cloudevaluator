import { Request, Response } from 'express';
export declare const addTaskToQuestion: (req: Request, res: Response) => Promise<void>;
export declare const getTasksForQuestion: (req: Request, res: Response) => Promise<void>;
export declare const getTaskDetails: (req: Request, res: Response) => Promise<void>;
export declare const updateTask: (req: Request, res: Response) => Promise<void>;
export declare const deleteTask: (req: Request, res: Response) => Promise<void>;
export declare const validateTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=taskController.d.ts.map