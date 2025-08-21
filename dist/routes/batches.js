"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validators_1 = require("../utils/validators");
const batchController_1 = require("../controllers/batchController");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin', 'instructor']), (0, validation_1.validateRequest)(validators_1.createBatchSchema), batchController_1.createBatch);
router.get('/:id', auth_1.authenticateToken, batchController_1.getBatchDetails);
router.post('/:id/students', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin', 'instructor']), batchController_1.addStudentsToBatch);
router.delete('/:id/students/:student_id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin', 'instructor']), batchController_1.removeStudentFromBatch);
exports.default = router;
//# sourceMappingURL=batches.js.map