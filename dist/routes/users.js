"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), userController_1.userController.getUsers);
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), (0, validation_1.validateRequest)(validators_1.createUserSchema), userController_1.userController.createUser);
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), userController_1.userController.updateUser);
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), userController_1.userController.deleteUser);
router.get('/by-role/:role', auth_1.authenticateToken, userController_1.userController.getUsersByRole);
router.get('/:id/assessments', auth_1.authenticateToken, userController_1.userController.getUserAssessments);
router.post('/:id/assessments', auth_1.authenticateToken, (0, validation_1.validateRequest)(validators_1.createAssessmentSchema), userController_1.userController.addUserAssessment);
exports.default = router;
class UserController {
    async getUserAssessments(req, res) {
        try {
            const userId = req.params.id;
            const assessments = [];
            res.status(200).json(assessments);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch user assessments' });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=users.js.map