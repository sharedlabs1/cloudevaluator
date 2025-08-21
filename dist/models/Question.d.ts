import { Model } from 'sequelize';
export declare class Question extends Model {
    id: number;
    assessmentId: number;
    scenario: string;
    evaluationScript: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Task extends Model {
    id: number;
    questionId: number;
    description: string;
    marks: number;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=Question.d.ts.map