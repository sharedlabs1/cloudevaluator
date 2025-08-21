import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class UserController {
    getUsers(req: AuthRequest, res: Response): Promise<void>;
    createUser(req: AuthRequest, res: Response): Promise<void>;
    updateUser(req: AuthRequest, res: Response): Promise<void>;
    deleteUser(req: AuthRequest, res: Response): Promise<void>;
    getUsersByRole(req: AuthRequest, res: Response): Promise<void>;
    getUserAssessments(req: AuthRequest, res: Response): Promise<void>;
    addUserAssessment(req: AuthRequest, res: Response): Promise<void>;
}
export declare const userController: UserController;
//# sourceMappingURL=userController.d.ts.map