"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const proctorController_1 = require("../controllers/proctorController");
const proctorService_1 = require("../services/proctorService");
const database_1 = __importDefault(require("../config/database"));
const sockets_1 = require("../sockets");
const proctorService = new proctorService_1.ProctorService(database_1.default, sockets_1.socketService);
const router = (0, express_1.Router)();
router.get('/dashboard', proctorController_1.getProctorDashboard);
router.post('/api/proctor/start', proctorController_1.startProctoringSession);
router.post('/api/proctor/violation', proctorController_1.recordViolation);
router.post('/api/proctor/recording', proctorController_1.saveRecording);
router.get('/api/proctor/dashboard', proctorController_1.getProctorDashboard);
exports.default = router;
//# sourceMappingURL=proctor.js.map