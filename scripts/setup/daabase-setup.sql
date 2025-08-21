// ========================================================================================
// 17. DATABASE SETUP SCRIPT
// ========================================================================================

// scripts/setup/database-setup.sql

-- Cloud Assessment Platform Database Setup Script
-- Run this script to set up the complete database schema

-- Create database (run as postgres user)
-- CREATE DATABASE cloud_assessment;
-- CREATE USER assessment_user WITH PASSWORD 'secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE cloud_assessment TO assessment_user;

-- Connect to the database
-- \c cloud_assessment;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users and Roles
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'instructor', 'proctor', 'student')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP Management
CREATE TABLE IF NOT EXISTS otp_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cloud Accounts Configuration
CREATE TABLE IF NOT EXISTS cloud_accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(10) NOT NULL CHECK (provider IN ('aws', 'azure', 'gcp')),
    credentials JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batches
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INTEGER REFERENCES users(id),
    cloud_account_id INTEGER REFERENCES cloud_accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batch Students
CREATE TABLE IF NOT EXISTS batch_students (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, student_id)
);

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    case_study_content TEXT NOT NULL,
    total_marks INTEGER DEFAULT 0,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Tasks
CREATE TABLE IF NOT EXISTS assessment_tasks (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
    task_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    cloud_provider VARCHAR(10) NOT NULL CHECK (cloud_provider IN ('aws', 'azure', 'gcp')),
    total_marks INTEGER DEFAULT 0,
    evaluation_script TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assessment_id, task_number)
);

-- Task Checks
CREATE TABLE IF NOT EXISTS task_checks (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES assessment_tasks(id) ON DELETE CASCADE,
    check_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    points INTEGER NOT NULL,
    validation_script TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, check_number)
);

-- Assessment Allocations
CREATE TABLE IF NOT EXISTS assessment_allocations (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER REFERENCES assessments(id),
    batch_id INTEGER REFERENCES batches(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    allocated_by INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Assessments (Individual instances)
CREATE TABLE IF NOT EXISTS student_assessments (
    id SERIAL PRIMARY KEY,
    allocation_id INTEGER REFERENCES assessment_allocations(id),
    student_id INTEGER REFERENCES users(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    submitted_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'auto_submitted')),
    total_score INTEGER DEFAULT 0,
    percentage REAL DEFAULT 0,
    grade VARCHAR(5),
    cloud_user_credentials JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Results
CREATE TABLE IF NOT EXISTS task_results (
    id SERIAL PRIMARY KEY,
    student_assessment_id INTEGER REFERENCES student_assessments(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES assessment_tasks(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    score INTEGER DEFAULT 0,
    max_score INTEGER NOT NULL,
    evaluation_log TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Check Results
CREATE TABLE IF NOT EXISTS check_results (
    id SERIAL PRIMARY KEY,
    task_result_id INTEGER REFERENCES task_results(id) ON DELETE CASCADE,
    check_id INTEGER REFERENCES task_checks(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed')),
    score INTEGER DEFAULT 0,
    max_score INTEGER NOT NULL,
    evidence TEXT,
    error_message TEXT,
    evaluated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proctoring Sessions
CREATE TABLE IF NOT EXISTS proctoring_sessions (
    id SERIAL PRIMARY KEY,
    student_assessment_id INTEGER REFERENCES student_assessments(id),
    proctor_id INTEGER REFERENCES users(id),
    session_start TIMESTAMP,
    session_end TIMESTAMP,
    screen_recording_path VARCHAR(500),
    camera_recording_path VARCHAR(500),
    violation_logs JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'flagged')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File Attachments
CREATE TABLE IF NOT EXISTS assessment_files (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    scenario TEXT NOT NULL,
    evaluation_script TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question Tasks Table
CREATE TABLE IF NOT EXISTS question_tasks (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_user_id ON otp_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_expires ON otp_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_student_assessments_status ON student_assessments(status);
CREATE INDEX IF NOT EXISTS idx_student_assessments_student_id ON student_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_task_results_student_assessment ON task_results(student_assessment_id);
CREATE INDEX IF NOT EXISTS idx_check_results_task_result ON check_results(task_result_id);
CREATE INDEX IF NOT EXISTS idx_assessment_allocations_batch ON assessment_allocations(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_students_batch_id ON batch_students(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_students_student_id ON batch_students(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_by ON assessments(created_by);
CREATE INDEX IF NOT EXISTS idx_assessment_tasks_assessment_id ON assessment_tasks(assessment_id);
CREATE INDEX IF NOT EXISTS idx_task_checks_task_id ON task_checks(task_id);

-- Create default admin user (password will be set via OTP)
INSERT INTO users (email, username, role, first_name, last_name) 
VALUES ('admin@assessment.com', 'admin', 'admin', 'System', 'Administrator')
ON CONFLICT (email) DO NOTHING;

-- Grant permissions to assessment_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO assessment_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO assessment_user;

-- Sample cloud account (encrypt credentials in production)
INSERT INTO cloud_accounts (name, provider, credentials, created_by)
SELECT 'Default AWS Account', 'aws', '{"accessKeyId": "AKIAIOSFODNN7EXAMPLE", "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY", "region": "us-east-1"}'::jsonb, 1
WHERE EXISTS (SELECT 1 FROM users WHERE role = 'admin')
ON CONFLICT DO NOTHING;
