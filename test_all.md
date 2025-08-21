# PowerShell Commands for Auth APIs

```powershell
# Generate OTP
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/generate-otp" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test@example.com"}'

# Verify OTP
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/verify-otp" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test@example.com", "otp": "123456"}'

# Login
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "admin@example.com", "password": "admin123"}'

# Refresh Token
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/refresh-token" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"refreshToken": "your-refresh-token"}'

# Logout
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/logout" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"refreshToken": "your-refresh-token"}'
```

# PowerShell Commands for AI APIs

```powershell
# Get AI Models
Invoke-WebRequest -Uri "http://localhost:3000/api/ai/models" -Method GET -Headers @{"Authorization"="Bearer your-access-token"}

# Evaluate AI Model
Invoke-WebRequest -Uri "http://localhost:3000/api/ai/evaluate" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer your-access-token"} -Body '{"modelId": "model-123", "input": "test input"}'

# Get AI Evaluation Results
Invoke-WebRequest -Uri "http://localhost:3000/api/ai/results" -Method GET -Headers @{"Authorization"="Bearer your-access-token"}
```

# Additional API Commands

## Evaluation APIs

```powershell
# Start Evaluation
Invoke-WebRequest -Uri "http://localhost:3000/evaluation/start" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"studentAssessmentId": 1, "initiatedBy": "admin@example.com"}'

# Cancel Evaluation
Invoke-WebRequest -Uri "http://localhost:3000/evaluation/cancel" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"evaluationJobId": 123, "userId": "admin@example.com"}'

# Retry Evaluation
Invoke-WebRequest -Uri "http://localhost:3000/evaluation/retry" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"originalJobId": 123, "userId": "admin@example.com"}'
```

## Proctoring APIs

```powershell
# Start Proctoring Session
Invoke-WebRequest -Uri "http://localhost:3000/proctor/start" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"studentAssessmentId": 1, "proctorId": 2}'

# Record Violation
Invoke-WebRequest -Uri "http://localhost:3000/proctor/violation" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"sessionId": 1, "violationType": "cheating", "evidence": {"screenshot": "base64string"}}'

# Save Recording
Invoke-WebRequest -Uri "http://localhost:3000/proctor/recording" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"sessionId": 1, "recordingType": "screen", "filePath": "/recordings/session1/screen.mp4"}'
```

## Authentication APIs

```powershell
# Login
Invoke-WebRequest -Uri "http://localhost:3000/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "admin@example.com", "password": "admin123"}'

# Register
Invoke-WebRequest -Uri "http://localhost:3000/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "admin@example.com", "username": "admin", "password": "admin123", "role": "student", "first_name": "John", "last_name": "Doe"}'
```

## User APIs

```powershell
# Get User Profile
Invoke-WebRequest -Uri "http://localhost:3000/users/profile" -Method GET -Headers @{"Authorization"="Bearer your-access-token"}
```

## Cloud APIs

```powershell
# Get Cloud Accounts
Invoke-WebRequest -Uri "http://localhost:3000/cloud/accounts" -Method GET

# Create Cloud Account
Invoke-WebRequest -Uri "http://localhost:3000/cloud/accounts" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"name": "AWS Account", "provider": "aws", "credentials": {"accessKeyId": "AKIA...", "secretAccessKey": "..."}}'
```

## WebSocket APIs

```powershell
# WebSocket Events for Evaluation
# Note: WebSocket connections are not directly testable via PowerShell. Use a WebSocket client like wscat or Postman.
```