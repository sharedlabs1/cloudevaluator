import Joi from 'joi';

export const createAssessmentSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000),
  case_study_content: Joi.string().required(),
  duration_minutes: Joi.number().min(1).max(1440).required(),
  tasks: Joi.array().items(Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(1000),
    instructions: Joi.string().required(),
    cloud_provider: Joi.string().valid('aws', 'azure', 'gcp').required(),
    total_marks: Joi.number().min(1).required(),
    evaluation_script: Joi.string().required(),
    checks: Joi.array().items(Joi.object({
      title: Joi.string().min(3).max(255).required(),
      description: Joi.string().max(500),
      points: Joi.number().min(1).required(),
      validation_script: Joi.string().required()
    })).min(1).required()
  })).min(1).required()
});

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(50),
  role: Joi.string().valid('admin', 'instructor', 'proctor', 'student').required(),
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required()
});

export const createBatchSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000),
  instructor_id: Joi.number().required(),
  cloud_account_id: Joi.number().required(),
  student_ids: Joi.array().items(Joi.number()).min(1).required()
});
