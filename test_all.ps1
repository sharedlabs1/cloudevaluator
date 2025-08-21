# PowerShell script to test all APIs

# Set API base URL
$BASE_URL = "http://localhost:3000"

# Login and store JWT token
$response = (Invoke-WebRequest -Method Post -Uri "$BASE_URL/api/auth/login" -ContentType "application/json" -Body (@{email="admin@example.com"; password="admin123"} | ConvertTo-Json -Depth 10)).Content | ConvertFrom-Json
$token = $response.token

# Output file
$OUTPUT_FILE = "output.txt"
if (Test-Path $OUTPUT_FILE) { Remove-Item $OUTPUT_FILE }

# Test all APIs

# Generate OTP
"Testing Generate OTP API..." | Out-File -FilePath $OUTPUT_FILE -Append
(Invoke-WebRequest -Method Post -Uri "$BASE_URL/api/auth/generate-otp" -ContentType "application/json" -Body (@{email="test@example.com"} | ConvertTo-Json -Depth 10)).Content | Out-File -FilePath $OUTPUT_FILE -Append

# Verify OTP
"Testing Verify OTP API..." | Out-File -FilePath $OUTPUT_FILE -Append
(Invoke-WebRequest -Method Post -Uri "$BASE_URL/api/auth/verify-otp" -ContentType "application/json" -Body (@{email="test@example.com"; otp="123456"} | ConvertTo-Json -Depth 10)).Content | Out-File -FilePath $OUTPUT_FILE -Append

# Start Evaluation
"Testing Start Evaluation API..." | Out-File -FilePath $OUTPUT_FILE -Append
(Invoke-WebRequest -Method Post -Uri "$BASE_URL/evaluation/start" -ContentType "application/json" -Headers @{Authorization = "Bearer $token"} -Body (@{studentAssessmentId=1; initiatedBy="admin@example.com"} | ConvertTo-Json -Depth 10)).Content | Out-File -FilePath $OUTPUT_FILE -Append

# Cancel Evaluation
"Testing Cancel Evaluation API..." | Out-File -FilePath $OUTPUT_FILE -Append
(Invoke-WebRequest -Method Post -Uri "$BASE_URL/evaluation/cancel" -ContentType "application/json" -Headers @{Authorization = "Bearer $token"} -Body (@{evaluationJobId=123; userId="admin@example.com"} | ConvertTo-Json -Depth 10)).Content | Out-File -FilePath $OUTPUT_FILE -Append

# Retry Evaluation
"Testing Retry Evaluation API..." | Out-File -FilePath $OUTPUT_FILE -Append
(Invoke-WebRequest -Method Post -Uri "$BASE_URL/evaluation/retry" -ContentType "application/json" -Headers @{Authorization = "Bearer $token"} -Body (@{originalJobId=123; userId="admin@example.com"} | ConvertTo-Json -Depth 10)).Content | Out-File -FilePath $OUTPUT_FILE -Append

# Start Proctoring Session
"Testing Start Proctoring Session API..." | Out-File -FilePath $OUTPUT_FILE -Append
(Invoke-WebRequest -Method Post -Uri "$BASE_URL/proctor/start" -ContentType "application/json" -Headers @{Authorization = "Bearer $token"} -Body (@{studentAssessmentId=1; proctorId=2} | ConvertTo-Json -Depth 10)).Content | Out-File -FilePath $OUTPUT_FILE -Append

# Record Violation
"Testing Record Violation API..." | Out-File -FilePath $OUTPUT_FILE -Append
(Invoke-WebRequest -Method Post -Uri "$BASE_URL/proctor/violation" -ContentType "application/json" -Headers @{Authorization = "Bearer $token"} -Body (@{sessionId=1; violationType="cheating"; evidence=@{screenshot="base64string"}} | ConvertTo-Json -Depth 10)).Content | Out-File -FilePath $OUTPUT_FILE -Append

# Save Recording
"Testing Save Recording API..." | Out-File -FilePath $OUTPUT_FILE -Append
(Invoke-WebRequest -Method Post -Uri "$BASE_URL/proctor/recording" -ContentType "application/json" -Headers @{Authorization = "Bearer $token"} -Body (@{sessionId=1; recordingType="screen"; filePath="/recordings/session1/screen.mp4"} | ConvertTo-Json -Depth 10)).Content | Out-File -FilePath $OUTPUT_FILE -Append

# Get User Profile
"Testing Get User Profile API..." | Out-File -FilePath $OUTPUT_FILE -Append
(Invoke-WebRequest -Method Get -Uri "$BASE_URL/users/profile" -Headers @{Authorization = "Bearer $token"}).Content | Out-File -FilePath $OUTPUT_FILE -Append

# Get Cloud Accounts
"Testing Get Cloud Accounts API..." | Out-File -FilePath $OUTPUT_FILE -Append
(Invoke-WebRequest -Method Get -Uri "$BASE_URL/cloud/accounts" -Headers @{Authorization = "Bearer $token"}).Content | Out-File -FilePath $OUTPUT_FILE -Append

# Create Cloud Account
"Testing Create Cloud Account API..." | Out-File -FilePath $OUTPUT_FILE -Append
(Invoke-WebRequest -Method Post -Uri "$BASE_URL/cloud/accounts" -ContentType "application/json" -Headers @{Authorization = "Bearer $token"} -Body (@{name="AWS Account"; provider="aws"; credentials=@{accessKeyId="AKIA..."; secretAccessKey="..."}} | ConvertTo-Json -Depth 10)).Content | Out-File -FilePath $OUTPUT_FILE -Append

# End script
"All tests completed. Results saved in $OUTPUT_FILE" | Out-File -FilePath $OUTPUT_FILE -Append