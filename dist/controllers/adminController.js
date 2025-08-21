"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboard = void 0;
const User_1 = require("../models/User");
const Assessment_1 = require("../models/Assessment");
const Batch_1 = require("../models/Batch");
const getAdminDashboard = async (req, res) => {
    try {
        const data = {
            total_users: await User_1.User.count(),
            total_assessments: await Assessment_1.Assessment.count(),
            total_batches: await Batch_1.Batch.count(),
            recent_activities: [
                { timestamp: '2025-08-20T10:00:00Z', activity: 'User John Doe created an assessment.' },
                { timestamp: '2025-08-20T11:00:00Z', activity: 'Batch A was allocated to Assessment 1.' }
            ]
        };
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch admin dashboard data' });
    }
};
exports.getAdminDashboard = getAdminDashboard;
//# sourceMappingURL=adminController.js.map