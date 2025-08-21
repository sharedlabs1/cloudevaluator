const axios = require('axios');

// List of API endpoints to test
const endpoints = [
  { method: 'GET', url: '/api/auth/profile' },
  { method: 'POST', url: '/api/auth/login', data: { email: 'test@example.com', password: 'password123' } },
  { method: 'POST', url: '/api/auth/create-user', data: { email: 'newuser@example.com', username: 'newuser', password: 'password123', role: 'STUDENT', first_name: 'New', last_name: 'User' } },
  { method: 'GET', url: '/api/dashboard/admin' },
  { method: 'GET', url: '/api/dashboard/student' },
  { method: 'GET', url: '/api/dashboard/proctor' },
  { method: 'POST', url: '/api/evaluation/start', data: { studentAssessmentId: 1, initiatedBy: 'admin@example.com' } },
  { method: 'POST', url: '/api/evaluation/cancel', data: { evaluationJobId: 1, userId: 'admin@example.com' } },
  { method: 'POST', url: '/api/evaluation/retry', data: { originalJobId: 1, userId: 'admin@example.com' } },
  { method: 'GET', url: '/api/cloud' },
  { method: 'POST', url: '/api/cloud', data: { name: 'AWS Account', provider: 'aws', credentials: { accessKeyId: 'AKIA...', secretAccessKey: '...' }, description: 'Test AWS Account' } },
  { method: 'GET', url: '/api/batches' },
  { method: 'POST', url: '/api/batches', data: { name: 'Batch A', description: 'Test Batch', instructor_id: 1, cloud_account_id: 1, student_ids: [1, 2, 3] } },
  { method: 'GET', url: '/api/users' },
  { method: 'POST', url: '/api/users', data: { email: 'user@example.com', username: 'testuser', password: 'password123', role: 'STUDENT', first_name: 'Test', last_name: 'User' } },
];

const baseURL = 'http://localhost:3000'; // Update with your API base URL

(async () => {
  console.log('Testing API endpoints...');

  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${baseURL}${endpoint.url}`,
        data: endpoint.data || {},
        headers: { Authorization: `Bearer YOUR_TOKEN_HERE` }
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