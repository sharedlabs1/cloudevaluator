export interface User {
    id: number;
    email: string;
    username: string;
    password_hash?: string;
    role: 'admin' | 'instructor' | 'proctor' | 'student';
    first_name: string;
    last_name: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface AuthToken {
    userId: number;
    email: string;
    role: string;
    iat: number;
    exp: number;
}
export interface OTPToken {
    id: number;
    user_id: number;
    otp_code: string;
    expires_at: Date;
    is_used: boolean;
    created_at: Date;
}
//# sourceMappingURL=auth.d.ts.map