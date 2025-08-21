export declare class EmailService {
    sendOTP(email: string, otp: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean>;
    sendWelcomeEmail(email: string, firstName: string): Promise<boolean>;
}
export declare const emailService: EmailService;
//# sourceMappingURL=emailService.d.ts.map