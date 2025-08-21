import { Application } from 'express';
declare class App {
    app: Application;
    server: any;
    port: number;
    constructor();
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    private setupServer;
    initialize(): Promise<void>;
    private createDirectories;
    listen(): void;
    getApp(): Application;
    getServer(): any;
}
declare const app: App;
export default app;
//# sourceMappingURL=app.d.ts.map