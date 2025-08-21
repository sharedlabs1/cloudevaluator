// src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Import configurations
import { connectRedis } from './config/redis';
import pool from './config/database';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';

// Import routes
import routes from './routes';

// Import socket service
import { initializeSocket } from './sockets';

// Import services
import { authService } from './services/authService';

// Import utilities
import logger from './utils/logger';

// Load environment variables
dotenv.config();

class App {
  public app: Application;
  public server: any;
  public port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.setupServer();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable for development
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Rate limiting
    this.app.use('/api', apiLimiter);

    // Static file serving (for uploaded files and reports)
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    this.app.use('/reports', express.static(path.join(__dirname, '../reports')));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });

    // Production static file serving for frontend
    if (process.env.NODE_ENV === 'production') {
      this.app.use(express.static(path.join(__dirname, '../../frontend/build')));
    }

    // Swagger setup
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
            url: 'http://localhost:3000/', // Updated to include /api base path
            description: 'Local server with /api base path',
          },
        ],
      },
      apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts', './src/models/**/*.ts'],
    };

    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Cloud Assessment Platform API is running',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // Serve frontend in production
    if (process.env.NODE_ENV === 'production') {
      this.app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
      });
    }

    // 404 handler for API routes
    this.app.use('/api/*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'API endpoint not found'
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private setupServer(): void {
    this.server = createServer(this.app);
    
    // Initialize Socket.IO
    initializeSocket(this.server);
  }

  public async initialize(): Promise<void> {
    try {
      // Test database connection
      await pool.query('SELECT NOW()');
      logger.info('Database connected successfully');

      // Connect to Redis
      await connectRedis();
      logger.info('Redis connected successfully');

      // Create upload directories
      this.createDirectories();

      logger.info('Application initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize application:', error);
      process.exit(1);
    }
  }

  private createDirectories(): void {
    const fs = require('fs');
    const directories = ['uploads', 'reports', 'recordings', 'logs'];
    
    directories.forEach(dir => {
      const dirPath = path.join(__dirname, `../${dir}`);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        logger.info(`Created directory: ${dirPath}`);
      }
    });
  }

  public listen(): void {
    this.server.listen(this.port, () => {
      logger.info(`Cloud Assessment Platform API running on port ${this.port}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`API Documentation: http://localhost:${this.port}/api/health`);
      }
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public getServer(): any {
    return this.server;
  }
}

// Initialize and start the application
const app = new App();

app.initialize().then(() => {
  app.listen();
}).catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  app.getServer().close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  app.getServer().close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app;