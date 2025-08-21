"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const redis_1 = require("./config/redis");
const database_1 = __importDefault(require("./config/database"));
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimit_1 = require("./middleware/rateLimit");
const routes_1 = __importDefault(require("./routes"));
const sockets_1 = require("./sockets");
const logger_1 = __importDefault(require("./utils/logger"));
dotenv_1.default.config();
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '3000');
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
        this.setupServer();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false
        }));
        this.app.use((0, cors_1.default)({
            origin: process.env.FRONTEND_URL || 'http://localhost:3001',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        this.app.use(express_1.default.json({ limit: '50mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
        this.app.use('/api', rateLimit_1.apiLimiter);
        this.app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
        this.app.use('/reports', express_1.default.static(path_1.default.join(__dirname, '../reports')));
        this.app.use((req, res, next) => {
            logger_1.default.info(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        });
        if (process.env.NODE_ENV === 'production') {
            this.app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/build')));
        }
        const swaggerOptions = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'Cloud Evaluator API',
                    version: '1.0.0',
                    description: 'API documentation for the Cloud Evaluator application',
                },
                servers: [
                    {
                        url: 'http://localhost:3000/',
                        description: 'Local server with /api base path',
                    },
                ],
            },
            apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts', './src/models/**/*.ts'],
        };
        const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
        this.app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
    }
    initializeRoutes() {
        this.app.use('/api', routes_1.default);
        this.app.get('/health', (req, res) => {
            res.json({
                success: true,
                message: 'Cloud Assessment Platform API is running',
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || '1.0.0'
            });
        });
        if (process.env.NODE_ENV === 'production') {
            this.app.get('*', (req, res) => {
                res.sendFile(path_1.default.join(__dirname, '../../frontend/build/index.html'));
            });
        }
        this.app.use('/api/*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'API endpoint not found'
            });
        });
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.errorHandler);
    }
    setupServer() {
        this.server = (0, http_1.createServer)(this.app);
        (0, sockets_1.initializeSocket)(this.server);
    }
    async initialize() {
        try {
            await database_1.default.query('SELECT NOW()');
            logger_1.default.info('Database connected successfully');
            await (0, redis_1.connectRedis)();
            logger_1.default.info('Redis connected successfully');
            this.createDirectories();
            logger_1.default.info('Application initialized successfully');
        }
        catch (error) {
            logger_1.default.error('Failed to initialize application:', error);
            process.exit(1);
        }
    }
    createDirectories() {
        const fs = require('fs');
        const directories = ['uploads', 'reports', 'recordings', 'logs'];
        directories.forEach(dir => {
            const dirPath = path_1.default.join(__dirname, `../${dir}`);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                logger_1.default.info(`Created directory: ${dirPath}`);
            }
        });
    }
    listen() {
        this.server.listen(this.port, () => {
            logger_1.default.info(`Cloud Assessment Platform API running on port ${this.port}`);
            logger_1.default.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            if (process.env.NODE_ENV !== 'production') {
                logger_1.default.info(`API Documentation: http://localhost:${this.port}/api/health`);
            }
        });
    }
    getApp() {
        return this.app;
    }
    getServer() {
        return this.server;
    }
}
const app = new App();
app.initialize().then(() => {
    app.listen();
}).catch((error) => {
    logger_1.default.error('Failed to start application:', error);
    process.exit(1);
});
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM received, shutting down gracefully');
    app.getServer().close(() => {
        logger_1.default.info('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT received, shutting down gracefully');
    app.getServer().close(() => {
        logger_1.default.info('Process terminated');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map