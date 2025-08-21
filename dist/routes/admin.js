"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
router.get('/api/admin/users', (req, res) => userController_1.userController.getUsers(req, res));
router.delete('/api/admin/users/:id', (req, res) => userController_1.userController.deleteUser(req, res));
router.get('/dashboard', adminController_1.getAdminDashboard);
exports.default = router;
//# sourceMappingURL=admin.js.map