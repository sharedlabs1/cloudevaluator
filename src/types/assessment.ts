export interface Assessment {
    id: number;
    title: string;
    description: string;
    case_study_content: string;
    total_marks: number;
    duration_minutes: number;
    is_active: boolean;
    created_by: number;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface AssessmentTask {
    id: number;
    assessment_id: number;
    task_number: number;
    title: string;
    description: string;
    instructions: string;
    cloud_provider: 'aws' | 'azure' | 'gcp';
    total_marks: number;
    evaluation_script: string;
    created_at: Date;
  }
  
  export interface TaskCheck {
    id: number;
    task_id: number;
    check_number: number;
    title: string;
    description: string;
    points: number;
    validation_script: string;
    created_at: Date;
  }
  
  export interface StudentAssessment {
    id: number;
    allocation_id: number;
    student_id: number;
    start_time?: Date;
    end_time?: Date;
    submitted_at?: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'auto_submitted';
    total_score: number;
    percentage: number;
    grade?: string;
    cloud_user_credentials?: any;
    created_at: Date;
  }