import { Request, Response } from 'express';
export declare const createCloudAccount: (req: Request, res: Response) => Promise<void>;
export declare const updateCloudAccount: (req: Request, res: Response) => Promise<void>;
export declare const deleteCloudAccount: (req: Request, res: Response) => Promise<void>;
export declare const getCloudAccounts: (_req: Request, res: Response) => Promise<void>;
export declare const testCloudConnection: (req: Request, res: Response) => Promise<void>;
export declare const allocateCloudAccount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCloudAllocations: (req: Request, res: Response) => Promise<void>;
export declare const removeCloudAllocation: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=cloudController.d.ts.map