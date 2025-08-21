import { Request, Response } from 'express';
export declare class AuthController {
    generateOTP(req: Request, res: Response): Promise<void>;
    verifyOTP(req: Request, res: Response): Promise<void>;
    createUser(req: Request, res: Response): Promise<void>;
    getProfile(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=authController.d.ts.map