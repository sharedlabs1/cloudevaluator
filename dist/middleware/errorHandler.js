"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const errorMessages_1 = require("../utils/errorMessages");
const errorHandler = (err, req, res, next) => {
    logger_1.default.error('Error handler:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });
    const statusCode = err.status || 500;
    const message = err.message || errorMessages_1.ERROR_MESSAGES.SERVER_ERROR;
    res.status(statusCode).json({
        error: true,
        message,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map