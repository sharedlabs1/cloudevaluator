import { DataTypes, Model } from 'sequelize';
import sequelize from '../utils/database';
import { Question } from './Question';

export class Assessment extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public score!: number; // New field for storing the final score
  public createdAt!: Date;
  public updatedAt!: Date;
}

Assessment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Assessment',
  }
);

Assessment.hasMany(Question, { foreignKey: 'assessmentId', as: 'questions' });
Question.belongsTo(Assessment, { foreignKey: 'assessmentId', as: 'assessment' });

