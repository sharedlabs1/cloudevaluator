# PowerShell script to test all APIs
# Save this as test-apis.ps1 and run with: .\test-apis.ps1

# Set API base URL
$BASE_URL = "http://localhost:3000"

Write-Host "Starting API tests..." -ForegroundColor Green

try {
    # Login and store JWT token
    Write-Host "Logging in..." -ForegroundColor Yellow
    $loginBody = @{
        email = "admin@example.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-WebRequest -Method Post -Uri "$BASE_URL/api/auth/login" -ContentType "application/json" -Body $loginBody
    $response = $loginResponse.Content | ConvertFrom-Json
    $token = $response.token
    Write-Host "Login successful! Token acquired." -ForegroundColor Green
}
catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Output file
$OUTPUT_FILE = "api-test-results.txt"
if (Test-Path $OUTPUT_FILE) { Remove-Item $OUTPUT_FILE }

# Function to test API and log results
function Test-API {
    param(
        [string]$TestName,
        [string]$Method,
        [string]$Uri,
        [string]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    Write-Host "Testing $TestName..." -ForegroundColor Cyan
    "=" * 50 | Out-File -FilePath $OUTPUT_FILE -Append
    "Testing $TestName" | Out-File -FilePath $OUTPUT_FILE -Append
    "URL: $Method $Uri" | Out-File -FilePath $OUTPUT_FILE -Append
    "Time: $(Get-Date)" | Out-File -FilePath $OUTPUT_FILE -Append
    "" | Out-File -FilePath $OUTPUT_FILE -Append
    
    try {
        if ($Body) {
            $result = Invoke-WebRequest -Method $Method -Uri $Uri -ContentType "application/json" -Headers $Headers -Body $Body
        } else {
            $result = Invoke-WebRequest -Method $Method -Uri $Uri -Headers $Headers
        }
        
        "Status: $($result.StatusCode) $($result.StatusDescription)" | Out-File -FilePath $OUTPUT_FILE -Append
        "Response:" | Out-File -FilePath $OUTPUT_FILE -Append
        $result.Content | Out-File -FilePath $OUTPUT_FILE -Append
        Write-Host "✓ $TestName - Success ($($result.StatusCode))" -ForegroundColor Green
    }
    catch {
        "Status: ERROR" | Out-File -FilePath $OUTPUT_FILE -Append
        "Error: $($_.Exception.Message)" | Out-File -FilePath $OUTPUT_FILE -Append
        if ($_.Exception.Response) {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $responseBody = $reader.ReadToEnd()
            "Response Body: $responseBody" | Out-File -FilePath $OUTPUT_FILE -Append
        }
        Write-Host "✗ $TestName - Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    "" | Out-File -FilePath $OUTPUT_FILE -Append
}

# Test Auth APIs
$authHeaders = @{Authorization = "Bearer $token"}

Test-API "Generate OTP" "Post" "$BASE_URL/api/auth/generate-otp" (@{email="admin@example.com"} | ConvertTo-Json)

Test-API "Verify OTP" "Post" "$BASE_URL/api/auth/verify-otp" (@{email="admin@example.com"; otp="123456"} | ConvertTo-Json)

Test-API "Get Profile" "Get" "$BASE_URL/api/auth/profile" -Headers $authHeaders

Test-API "Create User" "Post" "$BASE_URL/api/auth/create-user" (@{email="newuser@example.com"; username="newuser"; password="password123"; role="user"; first_name="New"; last_name="User"} | ConvertTo-Json) $authHeaders

# Test Health APIs
Test-API "Health Check" "Get" "$BASE_URL/health"

Test-API "API Health Check" "Get" "$BASE_URL/api/health"

# Test Evaluation APIs
Test-API "Start Evaluation" "Post" "$BASE_URL/api/evaluation/start" (@{studentAssessmentId=1; initiatedBy="admin@example.com"} | ConvertTo-Json) $authHeaders

Test-API "Cancel Evaluation" "Post" "$BASE_URL/api/evaluation/cancel" (@{evaluationJobId=123; userId="admin@example.com"} | ConvertTo-Json) $authHeaders

Test-API "Retry Evaluation" "Post" "$BASE_URL/api/evaluation/retry" (@{originalJobId=123; userId="admin@example.com"} | ConvertTo-Json) $authHeaders

# Test User APIs
Test-API "Get Users" "Get" "$BASE_URL/api/users" -Headers $authHeaders

# Test Assessment APIs
Test-API "Get Assessments" "Get" "$BASE_URL/api/assessments" -Headers $authHeaders

# Test Batch APIs
Test-API "Get Batches" "Get" "$BASE_URL/api/batches" -Headers $authHeaders

# Test Cloud APIs
Test-API "Get Cloud Accounts" "Get" "$BASE_URL/api/cloud-accounts" -Headers $authHeaders

Test-API "Create Cloud Account" "Post" "$BASE_URL/api/cloud-accounts" (@{name="AWS Test Account"; provider="aws"; credentials=@{accessKeyId="AKIA123"; secretAccessKey="secret123"}} | ConvertTo-Json) $authHeaders

# Summary
Write-Host "`nAll tests completed!" -ForegroundColor Green
Write-Host "Results saved in: $OUTPUT_FILE" -ForegroundColor Yellow
Write-Host "Check the file for detailed results." -ForegroundColor Yellow

# Optional: Open the results file
$openFile = Read-Host "`nOpen results file? (y/n)"
if ($openFile -eq 'y' -or $openFile -eq 'Y') {
    Start-Process notepad $OUTPUT_FILE
}