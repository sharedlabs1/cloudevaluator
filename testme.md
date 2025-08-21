# API Testing Guide with cURL

This document provides cURL commands to test the APIs exposed by the Cloud Evaluator application. Replace placeholders like `<BASE_URL>` and `<TOKEN>` with actual values.

## Prerequisites

1. Ensure the application is running. You can start the application using:
   ```bash
   npm run start
   ```

2. The base URL for the API is:
   ```
   http://localhost:3000
   ```

3. Obtain a valid JWT token for authenticated endpoints.

## cURL Commands

### Health Check
```bash
curl -X GET <BASE_URL>/health
```

### Authentication
#### Login
```bash
curl -X POST <BASE_URL>/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "user@example.com", "password": "password123"}'
```

### Questions
#### Create Question
```bash
curl -X POST <BASE_URL>/questions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <TOKEN>" \
-d '{"scenario": "Sample scenario", "tasks": ["Task 1", "Task 2"], "evaluationScript": "print(\"Hello World\")"}'
```

#### Validate Task
```bash
curl -X POST <BASE_URL>/questions/<QUESTION_ID>/validate \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <TOKEN>" \
-d '{"taskIndex": 0}'
```

### Assessments
#### Submit Assessment
```bash
curl -X POST <BASE_URL>/assessments/<ASSESSMENT_ID>/submit \
-H "Authorization: Bearer <TOKEN>"
```

### Users
#### Get Users
```bash
curl -X GET <BASE_URL>/users \
-H "Authorization: Bearer <TOKEN>"
```

### Batches
#### Get Batches
```bash
curl -X GET <BASE_URL>/batches \
-H "Authorization: Bearer <TOKEN>"
```

### Cloud Accounts
#### Get Cloud Accounts
```bash
curl -X GET <BASE_URL>/cloud-accounts \
-H "Authorization: Bearer <TOKEN>"
```

### Evaluation
#### Start Evaluation
```bash
curl -X POST <BASE_URL>/evaluation/start \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <TOKEN>" \
-d '{"assessmentId": 1}'
```

### Reports
#### Generate Assessment Report
```bash
curl -X GET <BASE_URL>/reports/assessment/<ASSESSMENT_ID> \
-H "Authorization: Bearer <TOKEN>"
```

#### Generate Batch Report
```bash
curl -X GET <BASE_URL>/reports/batch/<BATCH_ID> \
-H "Authorization: Bearer <TOKEN>"
```