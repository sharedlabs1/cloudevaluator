"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assessment = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
const Question_1 = require("./Question");
class Assessment extends sequelize_1.Model {
}
exports.Assessment = Assessment;
Assessment.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    score: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    modelName: 'Assessment',
});
Assessment.hasMany(Question_1.Question, { foreignKey: 'assessmentId', as: 'questions' });
Question_1.Question.belongsTo(Assessment, { foreignKey: 'assessmentId', as: 'assessment' });
//# sourceMappingURL=Assessment.js.map