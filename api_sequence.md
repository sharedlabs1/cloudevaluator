# Refined Logical Flow for Cloud Evaluator Application

## 1. User Authentication & Authorization
- User signs up or logs in (`/api/auth/register`, `/api/auth/login`).
- JWT or session token is issued and used for all subsequent requests.
- User roles (admin, instructor, student, proctor) determine access to features and endpoints.

## 2. Admin/Instructor: Assessment Lifecycle
### a. Create Assessment
- Admin/instructor creates an assessment with nested questions and tasks (each task has marks).
- Endpoint: `POST /api/assessments`
- Response includes the full nested structure.

### b. Manage Assessments
- List all assessments: `GET /api/assessments`
- View assessment details (with questions/tasks): `GET /api/assessments/:id`
- Update assessment/questions/tasks: `PUT /api/assessments/:id`, `PUT /api/questions/:id`, `PUT /api/tasks/:id`
- Delete assessment/questions/tasks: `DELETE /api/assessments/:id`, `DELETE /api/questions/:id`, `DELETE /api/tasks/:id`

### c. Allocate Assessment
- Allocate an assessment to a batch: `POST /api/assessments/allocate`
- Set start/end time, batch, and other allocation details.

## 3. Student: Assessment Participation
### a. View & Start Assessment
- Student views allocated assessments: `GET /api/student/assessments`
- Student starts an assessment: `POST /api/assessments/start`
- Assessment UI displays questions and tasks in order.

### b. Attempt Tasks
- Student attempts each task. The UI may provide validation, hints, or auto-save progress.
- Each task attempt is tracked in real time, including partial completions and marks.
- Task validation endpoint: `POST /api/tasks/:id/validate` (optional, for instant feedback).
- Task progress and marks are updated live and can be viewed by both student and instructor.

### c. Submit Assessment
- Student submits the completed assessment: `POST /api/assessments/submit`
- Backend evaluates all answers, calculates marks per task, aggregates to question and assessment level, and stores results.
- Submission is locked after this point; late submissions may be auto-submitted or flagged.

## 4. Evaluation & Results
- Evaluation jobs may run asynchronously, with real-time updates via WebSocket or polling endpoints.
- Student and instructor can view:
  - Progress: `GET /api/assessments/progress/:student_assessment_id` (shows current status, completed tasks, remaining tasks, etc.)
  - Results: `GET /api/assessments/results/:student_assessment_id` (shows detailed marks per task, per question, overall grade, and feedback)
- Results include:
  - Marks per task and question
  - Overall grade and percentage
  - Feedback or comments (if provided by evaluator)
  - Downloadable report (optional)

## 5. Proctoring (If Enabled)
- Proctor can monitor live sessions, record violations, and review evidence in real time.
- Proctor endpoints: `/api/proctor/*` (e.g., `/api/proctor/monitor`, `/api/proctor/violations`, `/api/proctor/review`)
- Proctoring features may include live video, screen monitoring, and automated violation detection.

## 6. Reporting & Analytics
- Admin/instructor can view reports on assessment performance, student progress, and cloud usage.
- Endpoints: `/api/reports/*`

## 7. Cloud Account & Resource Management
- Admin can manage cloud accounts: create, update, delete, test connection.
- Endpoints: `/api/cloud/*`
- Used for provisioning student environments during assessments.

## 8. User & Batch Management
- Admin/instructor manages users and batches: create, update, assign students, etc.
- Endpoints: `/api/users/*`, `/api/batches/*`

---

## Sequence Example: Student Assessment Flow
1. Student logs in.
2. Student fetches allocated assessments.
3. Student starts an assessment.
4. Student answers questions and completes tasks.
5. Student submits assessment.
6. System evaluates and stores results.
7. Student views results and feedback.

---

## Sequence Example: Admin Assessment Creation & Allocation
1. Admin logs in.
2. Admin creates an assessment with questions and tasks.
3. Admin allocates assessment to a batch.
4. Students in the batch see the new assessment and can start it at the scheduled time.

---

_This refined flow ensures a clear, logical, and user-centric progression through the application, supporting all major roles and use cases._