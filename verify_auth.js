const axios = require('axios');
const { spawn } = require('child_process');

async function testEndpoints() {
  console.log('Testing unauthenticated GET /api/loans...');
  try {
    await axios.get('http://localhost:5000/api/loans', { timeout: 2000 });
    console.error('❌ FAIL: GET /api/loans allowed unauthenticated access!');
    process.exit(1);
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log('✅ PASS: GET /api/loans rejected unauthenticated access with 401');
    } else {
      console.error(`❌ FAIL: Expected 401 but got error: ${err.message}`);
      process.exit(1);
    }
  }

  console.log('Testing unauthenticated PATCH /api/loans/1/payment...');
  try {
    await axios.patch('http://localhost:5000/api/loans/1/payment', {}, { timeout: 2000 });
    console.error('❌ FAIL: PATCH /api/loans/1/payment allowed unauthenticated access!');
    process.exit(1);
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log('✅ PASS: PATCH /api/loans/1/payment rejected unauthenticated access with 401');
    } else {
      console.error(`❌ FAIL: Expected 401 but got error: ${err.message}`);
      process.exit(1);
    }
  }

  console.log('All security tests passed!');
  process.exit(0);
}

// Start backend server in the background
console.log('Starting backend server for tests...');
const server = spawn('node', ['server.js'], { cwd: './backend', stdio: 'pipe' });

server.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Server running on port 5000')) {
    testEndpoints().finally(() => server.kill());
  }
});

setTimeout(() => {
  console.error('Timeout waiting for server to start');
  server.kill();
  process.exit(1);
}, 5000);
