"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchCloudConsole = exports.getStudentDashboard = void 0;
const studentService_1 = require("../services/studentService");
const studentService = new studentService_1.StudentService();
function getUserId(req) {
    if (req.userId)
        return req.userId;
    if (req.user && req.user.id)
        return req.user.id;
    if (req.auth && req.auth.userId)
        return req.auth.userId;
    return undefined;
}
const getStudentDashboard = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
        }
        const dashboard = await studentService.getStudentDashboard(userId);
        return res.status(200).json({ success: true, data: dashboard });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getStudentDashboard = getStudentDashboard;
const launchCloudConsole = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
        }
        const url = await studentService.getCloudConsoleUrl(userId, req.params.assessmentId);
        return res.status(200).json({ success: true, url });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.launchCloudConsole = launchCloudConsole;
//# sourceMappingURL=studentController.js.map