const axios = require('axios');

// List of API endpoints extracted from Swagger
const endpoints = [
  { method: 'POST', url: '/api/evaluation/start', data: { studentAssessmentId: 1, initiatedBy: 'admin@example.com' } },
  { method: 'POST', url: '/api/evaluation/cancel', data: { evaluationJobId: 123, userId: 'admin@example.com' } },
  { method: 'POST', url: '/api/evaluation/retry', data: { originalJobId: 123, userId: 'admin@example.com' } },
  { method: 'GET', url: '/api/evaluation/logs/1' },
  { method: 'POST', url: '/api/proctor/start', data: { studentAssessmentId: 1, proctorId: 2 } },
  { method: 'POST', url: '/api/proctor/violation', data: { sessionId: 1, violationType: 'cheating', evidence: { screenshot: 'base64string' } } },
  { method: 'POST', url: '/api/proctor/recording', data: { sessionId: 1, recordingType: 'screen', filePath: '/recordings/session1/screen.mp4' } },
  { method: 'POST', url: '/api/auth/login', data: { email: 'user@example.com', password: 'password123' } },
  { method: 'POST', url: '/api/auth/register', data: { email: 'user@example.com', username: 'johndoe', password: 'password123', role: 'student', first_name: 'John', last_name: 'Doe' } },
  { method: 'GET', url: '/api/users/profile' },
  { method: 'POST', url: '/api/users', data: { email: 'user@example.com', username: 'johndoe', password: 'password123', role: 'student', first_name: 'John', last_name: 'Doe' } },
  { method: 'GET', url: '/api/cloud/accounts' },
  { method: 'POST', url: '/api/cloud/accounts', data: { name: 'AWS Account', provider: 'aws', credentials: { accessKeyId: 'AKIA...', secretAccessKey: '...' }, description: 'Test AWS Account' } },
  { method: 'POST', url: '/api/cloud/accounts/1/test' },
  { method: 'POST', url: '/api/batches', data: { name: 'Batch A', description: 'Batch Description', instructor_id: 1, cloud_account_id: 1, student_ids: [1, 2, 3], status: 'active' } },
];

const baseURL = 'http://localhost:3000/api'; // Updated base URL to include /api

(async () => {
  console.log('Testing API endpoints from Swagger...');

  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${baseURL}${endpoint.url}`,
        data: endpoint.data || {},
      });

      console.log(`SUCCESS: ${endpoint.method} ${endpoint.url} - Status: ${response.status}`);
    } catch (error) {
      if (error.response) {
        console.error(`FAILURE: ${endpoint.method} ${endpoint.url} - Status: ${error.response.status}`);
      } else {
        console.error(`FAILURE: ${endpoint.method} ${endpoint.url} - Error: ${error.message}`);
      }
    }
  }
})();