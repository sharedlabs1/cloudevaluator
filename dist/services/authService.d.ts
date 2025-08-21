import { User } from '../types/auth';
export declare class AuthService {
    generateOTP(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOTP(email: string, otp: string): Promise<{
        success: boolean;
        token?: string;
        user?: any;
        message: string;
    }>;
    createUser(userData: Partial<User>): Promise<{
        success: boolean;
        user?: any;
        message: string;
    }>;
    authenticate(email: string, password: string): Promise<any>;
    generateToken(user: any): string;
}
export declare const authService: AuthService;
//# sourceMappingURL=authService.d.ts.map