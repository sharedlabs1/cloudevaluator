import { DataTypes, Model } from 'sequelize';
import sequelize from '../utils/database';

export class Question extends Model {
  public id!: number;
  public assessmentId!: number; // FK to Assessment
  public scenario!: string;
  public evaluationScript!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Question.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    assessmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    scenario: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    evaluationScript: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Question',
  }
);

export class Task extends Model {
  public id!: number;
  public questionId!: number;
  public description!: string;
  public marks!: number; // New field for marks
  public createdAt!: Date;
  public updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Task',
  }
);

// Add relationships
Question.hasMany(Task, { foreignKey: 'questionId', as: 'tasks' });
Task.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });