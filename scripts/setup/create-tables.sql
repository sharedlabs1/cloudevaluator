-- SQL script to create and update tables for the Cloud Evaluator application

-- Create or update the 'users' table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role userrole NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create or update the 'userrole' enum type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
        CREATE TYPE userrole AS ENUM ('student', 'admin', 'instructor');
    END IF;
END $$;

-- Create or update the 'assessments' table
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    case_study_content TEXT,
    duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create or update the 'batches' table
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INT REFERENCES users(id),
    cloud_account_id INT REFERENCES cloud_accounts(id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create or update the 'cloud_accounts' table
CREATE TABLE IF NOT EXISTS cloud_accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    credentials JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create or update the 'proctoring_sessions' table
CREATE TABLE IF NOT EXISTS proctoring_sessions (
    id SERIAL PRIMARY KEY,
    student_assessment_id INT REFERENCES assessments(id),
    proctor_id INT REFERENCES users(id),
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    violation_logs JSONB,
    screen_recording_path VARCHAR(255),
    camera_recording_path VARCHAR(255)
);

-- Create or update the 'violations' table
CREATE TABLE IF NOT EXISTS violations (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    assessment_title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create or update the 'questions' table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    scenario TEXT NOT NULL,
    tasks JSONB NOT NULL,
    evaluation_script TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create or update the 'otp_tokens' table
CREATE TABLE IF NOT EXISTS otp_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE
);

-- Create or update the 'evaluation_jobs' table
CREATE TABLE IF NOT EXISTS evaluation_jobs (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    target_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    progress INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    initiated_by INT REFERENCES users(id)
);

-- Create or update the 'task_results' table
CREATE TABLE IF NOT EXISTS task_results (
    id SERIAL PRIMARY KEY,
    student_assessment_id INT REFERENCES assessments(id),
    task_id INT NOT NULL,
    max_score INT NOT NULL,
    score INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    completed_at TIMESTAMP
);

-- Create or update the 'check_results' table
CREATE TABLE IF NOT EXISTS check_results (
    id SERIAL PRIMARY KEY,
    task_result_id INT REFERENCES task_results(id),
    check_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    score INT DEFAULT 0,
    max_score INT NOT NULL,
    evidence TEXT,
    error_message TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create or update the 'student_assessments' table
CREATE TABLE IF NOT EXISTS student_assessments (
    id SERIAL PRIMARY KEY,
    allocation_id INT REFERENCES batches(id),
    student_id INT REFERENCES users(id),
    total_score INT DEFAULT 0,
    percentage FLOAT DEFAULT 0,
    grade VARCHAR(5),
    status VARCHAR(50) DEFAULT 'in_progress',
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);