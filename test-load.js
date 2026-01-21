// Use built-in fetch (Node 18+) or install node-fetch for older versions
// For Node < 18: npm install node-fetch
const fetch = globalThis.fetch || (await import('node-fetch')).default;
const BASE_URL = process.env.API_URL || 'http://localhost:4000';

// Configuration
const CONCURRENT_USERS = 10;
const REQUESTS_PER_USER = 10;
const ENDPOINT = '/api/data-entries';

async function makeRequest(userId, requestId) {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Load Test User ${userId}`,
        message: `Load test request #${requestId} from user ${userId}`,
        location: '28.6139, 77.2090',
        contact: null
      })
    });
    
    const responseTime = Date.now() - start;
    const success = res.ok;
    
    return {
      success,
      responseTime,
      status: res.status,
      userId,
      requestId
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    return {
      success: false,
      responseTime,
      error: error.message,
      userId,
      requestId
    };
  }
}

async function simulateUser(userId) {
  const results = [];
  for (let i = 1; i <= REQUESTS_PER_USER; i++) {
    const result = await makeRequest(userId, i);
    results.push(result);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return results;
}

async function runLoadTest() {
  console.log('=== Load Testing ===\n');
  console.log(`Testing API at: ${BASE_URL}`);
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`Requests per User: ${REQUESTS_PER_USER}`);
  console.log(`Total Requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}\n`);
  
  const startTime = Date.now();
  
  // Run all users concurrently
  const userPromises = Array.from({ length: CONCURRENT_USERS }, (_, i) => 
    simulateUser(i + 1)
  );
  
  const allResults = await Promise.all(userPromises);
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Flatten results
  const flatResults = allResults.flat();
  
  // Calculate statistics
  const successful = flatResults.filter(r => r.success);
  const failed = flatResults.filter(r => !r.success);
  const responseTimes = flatResults.map(r => r.responseTime);
  
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);
  
  // Sort response times for percentile calculation
  const sortedTimes = [...responseTimes].sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
  
  const requestsPerSecond = (flatResults.length / totalTime) * 1000;
  
  // Print results
  console.log('=== Load Test Results ===');
  console.log(`Total Time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
  console.log(`Total Requests: ${flatResults.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Success Rate: ${((successful.length / flatResults.length) * 100).toFixed(2)}%`);
  console.log(`Requests per Second: ${requestsPerSecond.toFixed(2)}`);
  console.log('\nResponse Time Statistics:');
  console.log(`  Average: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`  Min: ${minResponseTime}ms`);
  console.log(`  Max: ${maxResponseTime}ms`);
  console.log(`  50th percentile (median): ${p50}ms`);
  console.log(`  95th percentile: ${p95}ms`);
  console.log(`  99th percentile: ${p99}ms`);
  
  if (failed.length > 0) {
    console.log('\nFailed Requests:');
    failed.forEach(f => {
      console.log(`  User ${f.userId}, Request ${f.requestId}: ${f.error || `Status ${f.status}`}`);
    });
  }
  
  // Performance assessment
  console.log('\n=== Performance Assessment ===');
  if (avgResponseTime < 500) {
    console.log('✓ Average response time is excellent (< 500ms)');
  } else if (avgResponseTime < 1000) {
    console.log('⚠ Average response time is acceptable (< 1s)');
  } else {
    console.log('✗ Average response time is too slow (> 1s)');
  }
  
  if (successful.length / flatResults.length >= 0.95) {
    console.log('✓ Success rate is excellent (>= 95%)');
  } else if (successful.length / flatResults.length >= 0.90) {
    console.log('⚠ Success rate is acceptable (>= 90%)');
  } else {
    console.log('✗ Success rate is too low (< 90%)');
  }
}

// Run load test
runLoadTest().catch(console.error);

