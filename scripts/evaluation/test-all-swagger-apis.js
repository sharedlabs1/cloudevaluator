const axios = require('axios');

// List of API endpoints extracted from Swagger
const endpoints = [
  { method: 'POST', url: '/evaluation/start', data: { studentAssessmentId: 1, initiatedBy: 'admin@example.com' } },
  { method: 'POST', url: '/evaluation/cancel', data: { evaluationJobId: 123, userId: 'admin@example.com' } },
  { method: 'POST', url: '/evaluation/retry', data: { originalJobId: 123, userId: 'admin@example.com' } },
  { method: 'GET', url: '/evaluation/logs/1' },
  { method: 'POST', url: '/proctor/start', data: { studentAssessmentId: 1, proctorId: 2 } },
  { method: 'POST', url: '/proctor/violation', data: { sessionId: 1, violationType: 'cheating', evidence: { screenshot: 'base64string' } } },
  { method: 'POST', url: '/proctor/recording', data: { sessionId: 1, recordingType: 'screen', filePath: '/recordings/session1/screen.mp4' } },
  { method: 'POST', url: '/auth/login', data: { email: 'user@example.com', password: 'password123' } },
  { method: 'POST', url: '/auth/register', data: { email: 'user@example.com', username: 'johndoe', password: 'password123', role: 'student', first_name: 'John', last_name: 'Doe' } },
  { method: 'GET', url: '/users/profile' },
  { method: 'POST', url: '/users', data: { email: 'user@example.com', username: 'johndoe', password: 'password123', role: 'student', first_name: 'John', last_name: 'Doe' } },
  { method: 'GET', url: '/cloud/accounts' },
  { method: 'POST', url: '/cloud/accounts', data: { name: 'AWS Account', provider: 'aws', credentials: { accessKeyId: 'AKIA...', secretAccessKey: '...' }, description: 'Test AWS Account' } },
  { method: 'POST', url: '/cloud/accounts/1/test' },
  { method: 'POST', url: '/batches', data: { name: 'Batch A', description: 'Batch Description', instructor_id: 1, cloud_account_id: 1, student_ids: [1, 2, 3], status: 'active' } },
];

const baseURL = 'http://localhost:3000'; // Update with your API base URL

(async () => {
  console.log('Testing all API endpoints from Swagger...');

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