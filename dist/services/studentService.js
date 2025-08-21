"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const assessmentService_1 = require("./assessmentService");
class StudentService {
    async getStudentDashboard(studentId) {
        const assessmentService = new assessmentService_1.AssessmentService();
        const assessments = await assessmentService.getAssessments();
        for (const assessment of assessments) {
            if (assessment.questions) {
                for (const question of assessment.questions) {
                    if (question.tasks) {
                        for (const task of question.tasks) {
                            task.cloudLink = await this.getCloudConsoleUrl(studentId, String(assessment.id));
                        }
                    }
                }
            }
        }
        return { assessments };
    }
    async getCloudConsoleUrl(studentId, assessmentId) {
        return `https://console.cloudprovider.com/session/${studentId}-${assessmentId}`;
    }
}
exports.StudentService = StudentService;
//# sourceMappingURL=studentService.js.map