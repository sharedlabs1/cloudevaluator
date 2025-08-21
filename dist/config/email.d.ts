import nodemailer from 'nodemailer';
export interface EmailConfig {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
        user?: string;
        pass?: string;
    };
}
export declare const createEmailTransporter: () => nodemailer.Transporter | null;
export declare const getEmailTransporter: () => nodemailer.Transporter | null;
declare const _default: {
    createEmailTransporter: () => nodemailer.Transporter | null;
    getEmailTransporter: () => nodemailer.Transporter | null;
};
export default _default;
//# sourceMappingURL=email.d.ts.map