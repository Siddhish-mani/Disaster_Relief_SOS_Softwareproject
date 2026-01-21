// Use built-in fetch (Node 18+) or install node-fetch for older versions
// For Node < 18: npm install node-fetch
const fetch = globalThis.fetch || (await import('node-fetch')).default;
const BASE_URL = process.env.API_URL || 'http://localhost:4000';

const securityTests = [
  {
    name: 'SQL Injection in name field',
    endpoint: '/api/data-entries',
    method: 'POST',
    body: {
      name: "'; DROP TABLE data_entries; --",
      message: 'Test message'
    },
    expectedStatus: 400
  },
  {
    name: 'XSS in message field',
    endpoint: '/api/data-entries',
    method: 'POST',
    body: {
      name: 'Test User',
      message: '<script>alert("XSS")</script>'
    },
    expectedStatus: 201 // Should accept but sanitize
  },
  {
    name: 'Very long name input',
    endpoint: '/api/data-entries',
    method: 'POST',
    body: {
      name: 'A'.repeat(10000),
      message: 'Test message'
    },
    expectedStatus: 400
  },
  {
    name: 'Missing required fields',
    endpoint: '/api/data-entries',
    method: 'POST',
    body: {
      name: '',
      message: ''
    },
    expectedStatus: 400
  },
  {
    name: 'SQL Injection in login',
    endpoint: '/api/auth/login',
    method: 'POST',
    body: {
      username: "admin' OR '1'='1",
      password: 'anything'
    },
    expectedStatus: 401
  },
  {
    name: 'Invalid JSON',
    endpoint: '/api/data-entries',
    method: 'POST',
    body: 'invalid json string',
    expectedStatus: 400,
    skipJson: true
  }
];

async function runSecurityTest(test) {
  try {
    const options = {
      method: test.method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (test.skipJson) {
      options.body = test.body;
    } else {
      options.body = JSON.stringify(test.body);
    }
    
    const res = await fetch(`${BASE_URL}${test.endpoint}`, options);
    const data = await res.json().catch(() => ({}));
    
    const passed = res.status === test.expectedStatus;
    const status = passed ? '✓' : '✗';
    
    console.log(`${status} ${test.name}`);
    console.log(`   Status: ${res.status} (Expected: ${test.expectedStatus})`);
    
    if (!passed) {
      console.log(`   ⚠️  WARNING: Expected status ${test.expectedStatus} but got ${res.status}`);
    }
    
    return { passed, status: res.status, expected: test.expectedStatus };
  } catch (error) {
    console.log(`✗ ${test.name}`);
    console.log(`   Error: ${error.message}`);
    return { passed: false, error: error.message };
  }
}

async function runSecurityTests() {
  console.log('=== Security Testing ===\n');
  console.log(`Testing API at: ${BASE_URL}\n`);
  
  const results = [];
  
  for (const test of securityTests) {
    const result = await runSecurityTest(test);
    results.push({ ...test, result });
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Summary
  console.log('\n=== Security Test Summary ===');
  const passed = results.filter(r => r.result.passed).length;
  const total = results.length;
  
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('✓ All security tests passed!');
  } else {
    console.log('✗ Some security tests failed - review the results above');
  }
}

// Run tests
runSecurityTests().catch(console.error);

