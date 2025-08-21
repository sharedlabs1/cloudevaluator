@echo off
REM ============================================
REM Project Directory Structure Setup Script
REM ============================================

REM Create root-level folders
mkdir src
mkdir scripts\evaluation
mkdir scripts\deployment
mkdir uploads
mkdir reports
mkdir recordings
mkdir config

REM Create subdirectories under src
mkdir src\controllers
mkdir src\middleware
mkdir src\models
mkdir src\services
mkdir src\utils
mkdir src\routes
mkdir src\sockets

REM Create files in src\controllers
echo. > src\controllers\authController.ts
echo. > src\controllers\assessmentController.ts
echo. > src\controllers\batchController.ts
echo. > src\controllers\cloudController.ts
echo. > src\controllers\evaluationController.ts
echo. > src\controllers\proctorController.ts
echo. > src\controllers\reportController.ts

REM Create files in src\middleware
echo. > src\middleware\auth.ts
echo. > src\middleware\validation.ts
echo. > src\middleware\upload.ts
echo. > src\middleware\rateLimit.ts

REM Create files in src\models
echo. > src\models\User.ts
echo. > src\models\Assessment.ts
echo. > src\models\Batch.ts
echo. > src\models\CloudAccount.ts

REM Create files in src\services
echo. > src\services\authService.ts
echo. > src\services\cloudService.ts
echo. > src\services\evaluationService.ts
echo. > src\services\emailService.ts
echo. > src\services\reportService.ts
echo. > src\services\proctorService.ts

REM Create files in src\utils
echo. > src\utils\database.ts
echo. > src\utils\encryption.ts
echo. > src\utils\logger.ts
echo. > src\utils\validators.ts

REM Create files in src\routes
echo. > src\routes\auth.ts
echo. > src\routes\assessments.ts
echo. > src\routes\admin.ts
echo. > src\routes\student.ts

REM Create files in src\sockets
echo. > src\sockets\evaluationSocket.ts
echo. > src\sockets\proctorSocket.ts

REM Create app.ts
echo. > src\app.ts

REM Create files in scripts\evaluation
echo. > scripts\evaluation\aws-evaluator.ts
echo. > scripts\evaluation\azure-evaluator.ts
echo. > scripts\evaluation\gcp-evaluator.ts

echo Project structure created successfully!
pause
