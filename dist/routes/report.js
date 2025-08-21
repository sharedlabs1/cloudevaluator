"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/cloud-summary', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin', 'instructor']), reportController_1.getCloudSummaryReport);
exports.default = router;
//# sourceMappingURL=report.js.map