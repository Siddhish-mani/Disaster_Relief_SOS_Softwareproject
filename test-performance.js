// Use built-in fetch (Node 18+) or install node-fetch for older versions
// For Node < 18: npm install node-fetch
const fetch = globalThis.fetch || (await import('node-fetch')).default;
const BASE_URL = process.env.API_URL || 'http://localhost:4000';

async function testResponseTime(endpoint, method = 'GET', body = null) {
  const start = Date.now();
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const end = Date.now();
    const responseTime = end - start;
    const data = await res.json().catch(() => ({}));
    
    const status = res.ok ? '✓' : '✗';
    console.log(`${status} ${method} ${endpoint}: ${responseTime}ms (Status: ${res.status})`);
    return { success: res.ok, responseTime, status: res.status };
  } catch (error) {
    const end = Date.now();
    const responseTime = end - start;
    console.error(`✗ ${method} ${endpoint}: Error after ${responseTime}ms - ${error.message}`);
    return { success: false, responseTime, error: error.message };
  }
}

async function runPerformanceTests() {
  console.log('=== Performance Testing ===\n');
  console.log(`Testing API at: ${BASE_URL}\n`);
  
  const results = {
    health: null,
    login: null,
    getEntries: null,
    postEntry: null,
  };
  
  // Test health endpoint
  console.log('1. Testing Health Endpoint...');
  results.health = await testResponseTime('/health');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test login endpoint
  console.log('\n2. Testing Login Endpoint...');
  results.login = await testResponseTime('/api/auth/login', 'POST', {
    username: 'testuser',
    password: 'testpass123'
  });
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test data entries GET
  console.log('\n3. Testing GET Data Entries...');
  results.getEntries = await testResponseTime('/api/data-entries');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test data entries POST
  console.log('\n4. Testing POST Data Entry...');
  results.postEntry = await testResponseTime('/api/data-entries', 'POST', {
    name: 'Performance Test User',
    message: 'Performance test SOS message',
    location: '28.6139, 77.2090',
    contact: null
  });
  
  // Summary
  console.log('\n=== Performance Test Summary ===');
  console.log(`Health Check: ${results.health.responseTime}ms (Expected: < 50ms)`);
  console.log(`Login: ${results.login.responseTime}ms (Expected: < 500ms)`);
  console.log(`GET Entries: ${results.getEntries.responseTime}ms (Expected: < 200ms)`);
  console.log(`POST Entry: ${results.postEntry.responseTime}ms (Expected: < 300ms)`);
  
  // Check if all passed thresholds
  const allPassed = 
    results.health.responseTime < 50 &&
    results.login.responseTime < 500 &&
    results.getEntries.responseTime < 200 &&
    results.postEntry.responseTime < 300;
  
  if (allPassed) {
    console.log('\n✓ All performance tests passed!');
  } else {
    console.log('\n✗ Some performance tests failed thresholds');
  }
}

// Run tests
runPerformanceTests().catch(console.error);

