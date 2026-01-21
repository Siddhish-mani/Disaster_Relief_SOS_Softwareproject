# Non-Functional Requirements Testing Guide

This guide covers how to test non-functional requirements for the Disaster SOS application.

## Table of Contents
1. [Performance Testing](#performance-testing)
2. [Reliability & Availability Testing](#reliability--availability-testing)
3. [Security Testing](#security-testing)
4. [Usability Testing](#usability-testing)
5. [Scalability Testing](#scalability-testing)
6. [Compatibility Testing](#compatibility-testing)
7. [Maintainability Testing](#maintainability-testing)
8. [Response Time Testing](#response-time-testing)

---

## Performance Testing

### 1. API Response Time Testing

**Tool**: Use `curl` or Postman with timing, or create a Node.js script

**Test Script** (`server/test-performance.js`):
```javascript
const fetch = require('node-fetch');
const BASE_URL = 'http://localhost:4000';

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
    
    console.log(`${method} ${endpoint}: ${responseTime}ms (Status: ${res.status})`);
    return responseTime;
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error.message);
    return null;
  }
}

async function runPerformanceTests() {
  console.log('=== Performance Testing ===\n');
  
  // Test health endpoint
  await testResponseTime('/health');
  
  // Test login endpoint
  await testResponseTime('/api/auth/login', 'POST', {
    username: 'testuser',
    password: 'testpass123'
  });
  
  // Test data entries GET
  await testResponseTime('/api/data-entries');
  
  // Test data entries POST
  await testResponseTime('/api/data-entries', 'POST', {
    name: 'Test User',
    message: 'Test SOS message',
    location: '28.6139, 77.2090',
    contact: null
  });
}

runPerformanceTests();
```

**Expected Results**:
- Health check: < 50ms
- Login: < 500ms
- GET data entries: < 200ms
- POST data entry: < 300ms

### 2. Load Testing

**Tool**: Apache Bench (ab) or Artillery

**Using Apache Bench**:
```bash
# Install Apache Bench (comes with Apache on most systems)
# Windows: Download from Apache website
# Linux/Mac: Usually pre-installed

# Test 100 requests with 10 concurrent users
ab -n 100 -c 10 http://localhost:4000/health

# Test POST endpoint
ab -n 50 -c 5 -p test-data.json -T application/json http://localhost:4000/api/data-entries
```

**Using Artillery** (Node.js tool):
```bash
npm install -g artillery

# Create artillery-config.yml
artillery quick --count 50 --num 10 http://localhost:4000/health
```

**Load Test Configuration** (`server/load-test.yml`):
```yaml
config:
  target: 'http://localhost:4000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"
scenarios:
  - name: "SOS Request Flow"
    flow:
      - post:
          url: "/api/data-entries"
          json:
            name: "Load Test User"
            message: "Load test SOS message"
            location: "28.6139, 77.2090"
```

### 3. Database Query Performance

**Test SQL Query Performance**:
```sql
-- Test query execution time
EXPLAIN SELECT * FROM data_entries ORDER BY created_at DESC;

-- Check for slow queries (if slow_query_log is enabled)
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;

-- Test with large dataset
-- Insert test data
INSERT INTO data_entries (name, message, location) 
SELECT CONCAT('User', id), 'Test message', '28.6139, 77.2090' 
FROM (SELECT @row := @row + 1 AS id FROM (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t1, (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t2, (SELECT @row := 0) r) numbers 
LIMIT 1000;

-- Measure query time
SET profiling = 1;
SELECT * FROM data_entries ORDER BY created_at DESC LIMIT 100;
SHOW PROFILES;
```

---

## Reliability & Availability Testing

### 1. Uptime Testing

**Tool**: Create a monitoring script

**Uptime Monitor** (`server/test-uptime.js`):
```javascript
const fetch = require('node-fetch');
const BASE_URL = 'http://localhost:4000';

let successCount = 0;
let failureCount = 0;
let totalResponseTime = 0;

async function checkHealth() {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const responseTime = Date.now() - start;
    totalResponseTime += responseTime;
    
    if (res.ok) {
      successCount++;
      console.log(`✓ Health check passed (${responseTime}ms)`);
    } else {
      failureCount++;
      console.log(`✗ Health check failed (Status: ${res.status})`);
    }
  } catch (error) {
    failureCount++;
    console.log(`✗ Health check error: ${error.message}`);
  }
}

// Run every 30 seconds for 1 hour
const interval = setInterval(checkHealth, 30000);
setTimeout(() => {
  clearInterval(interval);
  const total = successCount + failureCount;
  const uptime = (successCount / total) * 100;
  const avgResponseTime = totalResponseTime / total;
  
  console.log('\n=== Uptime Test Results ===');
  console.log(`Total checks: ${total}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failures: ${failureCount}`);
  console.log(`Uptime: ${uptime.toFixed(2)}%`);
  console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
}, 3600000); // 1 hour
```

### 2. Error Handling Testing

**Test Scenarios**:
```javascript
// Test invalid input
POST /api/data-entries
Body: { name: "", message: "" }  // Should return 400

// Test database connection failure
// Stop MySQL and test endpoints

// Test network timeout
// Simulate slow network with network throttling

// Test concurrent requests
// Send multiple requests simultaneously
```

### 3. Data Integrity Testing

**Test Database Transactions**:
```sql
-- Test transaction rollback on error
START TRANSACTION;
INSERT INTO data_entries (name, message) VALUES ('Test', 'Message');
-- Simulate error
ROLLBACK;
-- Verify data not inserted
SELECT * FROM data_entries WHERE name = 'Test';
```

---

## Security Testing

### 1. Authentication Testing

**Test Cases**:
```javascript
// Test SQL Injection
POST /api/auth/login
Body: { username: "admin' OR '1'='1", password: "anything" }
// Should reject and not expose database structure

// Test brute force protection
// Try 10+ failed login attempts
// Should implement rate limiting

// Test password strength
// Try weak passwords: "123", "password", "abc"
// Should enforce minimum requirements
```

### 2. Input Validation Testing

**Test Script** (`server/test-security.js`):
```javascript
const fetch = require('node-fetch');
const BASE_URL = 'http://localhost:4000';

const securityTests = [
  {
    name: 'SQL Injection in name field',
    endpoint: '/api/data-entries',
    method: 'POST',
    body: {
      name: "'; DROP TABLE data_entries; --",
      message: 'Test'
    }
  },
  {
    name: 'XSS in message field',
    endpoint: '/api/data-entries',
    method: 'POST',
    body: {
      name: 'Test',
      message: '<script>alert("XSS")</script>'
    }
  },
  {
    name: 'Very long input',
    endpoint: '/api/data-entries',
    method: 'POST',
    body: {
      name: 'A'.repeat(10000),
      message: 'B'.repeat(10000)
    }
  }
];

async function runSecurityTests() {
  for (const test of securityTests) {
    try {
      const res = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: test.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.body)
      });
      
      console.log(`${test.name}: ${res.status} ${res.statusText}`);
      // Should return 400 for invalid input
    } catch (error) {
      console.log(`${test.name}: Error - ${error.message}`);
    }
  }
}

runSecurityTests();
```

### 3. CORS & Headers Testing

**Test CORS Configuration**:
```bash
# Test from different origin
curl -H "Origin: http://malicious-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:4000/api/data-entries

# Should only allow requests from your app's origin
```

---

## Usability Testing

### 1. Mobile App Performance

**Test on Real Devices**:
- **Android**: Use Android Studio Profiler
- **iOS**: Use Xcode Instruments

**Key Metrics to Test**:
- App launch time (< 3 seconds)
- Screen transition time (< 300ms)
- Memory usage (should not exceed device limits)
- Battery consumption
- Network usage

### 2. Offline Functionality

**Test Scenarios**:
```javascript
// Test offline queue
1. Turn off WiFi/mobile data
2. Submit SOS request
3. Should save to AsyncStorage
4. Turn on network
5. Should automatically sync when online
```

**Test Script** (in React Native):
```javascript
// In SOSRequestScreen, test offline behavior
import NetInfo from '@react-native-community/netinfo';

// Monitor network state
NetInfo.addEventListener(state => {
  console.log('Network state:', state.isConnected);
});
```

### 3. Location Accuracy

**Test Location Services**:
- Test with GPS enabled/disabled
- Test with location permission denied
- Test location accuracy (should be within 10-50 meters)
- Test location update frequency

---

## Scalability Testing

### 1. Database Scalability

**Test with Large Dataset**:
```sql
-- Insert 10,000 test records
DELIMITER $$
CREATE PROCEDURE InsertTestData()
BEGIN
  DECLARE i INT DEFAULT 1;
  WHILE i <= 10000 DO
    INSERT INTO data_entries (name, message, location) 
    VALUES (CONCAT('User', i), CONCAT('Message ', i), '28.6139, 77.2090');
    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

CALL InsertTestData();

-- Test query performance with large dataset
EXPLAIN SELECT * FROM data_entries ORDER BY created_at DESC LIMIT 100;
```

### 2. Concurrent Users

**Test Multiple Simultaneous Users**:
```javascript
// Simulate 100 concurrent users
const users = Array.from({ length: 100 }, (_, i) => i);

async function simulateUser(userId) {
  // Login
  await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      username: `user${userId}`,
      password: 'password123'
    })
  });
  
  // Submit SOS
  await fetch(`${BASE_URL}/api/data-entries`, {
    method: 'POST',
    body: JSON.stringify({
      name: `User ${userId}`,
      message: `SOS from user ${userId}`,
      location: '28.6139, 77.2090'
    })
  });
}

// Run all users concurrently
Promise.all(users.map(simulateUser));
```

---

## Compatibility Testing

### 1. Browser/Platform Compatibility

**Test on Different Platforms**:
- Android (various versions: 8.0, 9.0, 10, 11, 12, 13, 14)
- iOS (various versions: 12, 13, 14, 15, 16, 17)
- Different screen sizes (phones, tablets)
- Different network types (WiFi, 4G, 5G, slow 3G)

### 2. API Compatibility

**Test API Versioning**:
```bash
# Test backward compatibility
# Ensure old API versions still work when new versions are added
```

---

## Response Time Testing

### 1. Mobile App Response Times

**Key Metrics**:
- **App Launch**: < 3 seconds
- **Screen Navigation**: < 300ms
- **API Calls**: < 2 seconds
- **Location Fetch**: < 5 seconds
- **Database Save**: < 1 second

**Test Using React Native Performance Monitor**:
```javascript
// Add performance markers
import { PerformanceObserver } from 'react-native-performance';

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});

observer.observe({ entryTypes: ['measure'] });

// Mark start
performance.mark('sos-submit-start');

// Your SOS submit code
await submitSOS();

// Mark end and measure
performance.mark('sos-submit-end');
performance.measure('sos-submit', 'sos-submit-start', 'sos-submit-end');
```

---

## Testing Tools Summary

### Recommended Tools:

1. **Performance**:
   - Apache Bench (ab)
   - Artillery
   - k6
   - Postman (with tests)

2. **Monitoring**:
   - PM2 (process manager with monitoring)
   - New Relic
   - Datadog

3. **Mobile Testing**:
   - React Native Debugger
   - Flipper
   - Android Studio Profiler
   - Xcode Instruments

4. **Security**:
   - OWASP ZAP
   - Burp Suite
   - npm audit

5. **Load Testing**:
   - Artillery
   - JMeter
   - Locust

---

## Quick Test Checklist

- [ ] API response times < 500ms
- [ ] App launches in < 3 seconds
- [ ] Handles 100+ concurrent users
- [ ] Works offline and syncs when online
- [ ] Location accuracy within 50 meters
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Works on Android 8.0+ and iOS 12+
- [ ] Database queries optimized with indexes
- [ ] Error messages are user-friendly
- [ ] Memory usage stays within limits
- [ ] Battery consumption is reasonable

---

## Running Tests

### Setup Test Environment:
```bash
# Install test dependencies
cd server
npm install --save-dev node-fetch artillery

# Run performance tests
node test-performance.js

# Run security tests
node test-security.js

# Run load tests
artillery run load-test.yml
```

### Continuous Testing:
Consider setting up automated testing in CI/CD pipeline to run these tests regularly.





