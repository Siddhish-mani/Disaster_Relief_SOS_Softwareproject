# Non-Functional Testing Guide

This directory contains test scripts for non-functional requirements testing.

## Setup

### Install Dependencies

If you're using Node.js < 18, you'll need to install `node-fetch`:

```bash
npm install node-fetch
```

For Node.js 18+, `fetch` is built-in.

### Make Scripts Executable (Linux/Mac)

```bash
chmod +x test-*.js
```

## Available Tests

### 1. Performance Testing

Tests API response times for key endpoints.

**Run:**
```bash
node test-performance.js
```

**What it tests:**
- Health endpoint response time
- Login endpoint response time
- GET data entries response time
- POST data entry response time

**Expected Results:**
- Health: < 50ms
- Login: < 500ms
- GET: < 200ms
- POST: < 300ms

### 2. Security Testing

Tests for common security vulnerabilities.

**Run:**
```bash
node test-security.js
```

**What it tests:**
- SQL injection protection
- XSS protection
- Input validation
- Missing field validation
- Invalid JSON handling

**Expected Results:**
All tests should return appropriate error codes (400/401) for invalid input.

### 3. Load Testing

Tests system performance under concurrent load.

**Run:**
```bash
node test-load.js
```

**What it tests:**
- 10 concurrent users
- 10 requests per user (100 total requests)
- Response time statistics
- Success rate
- Requests per second

**Configuration:**
Edit the constants at the top of `test-load.js`:
- `CONCURRENT_USERS`: Number of simultaneous users
- `REQUESTS_PER_USER`: Requests each user makes
- `ENDPOINT`: API endpoint to test

## Running All Tests

### Quick Test Suite

```bash
# Run all tests sequentially
echo "Running Performance Tests..."
node test-performance.js

echo -e "\n\nRunning Security Tests..."
node test-security.js

echo -e "\n\nRunning Load Tests..."
node test-load.js
```

### With Custom API URL

```bash
API_URL=http://10.44.209.105:4000 node test-performance.js
API_URL=http://10.44.209.105:4000 node test-security.js
API_URL=http://10.44.209.105:4000 node test-load.js
```

## Interpreting Results

### Performance Test Results

- ✓ Green checkmark = Test passed threshold
- ✗ Red X = Test failed threshold
- Response times are shown in milliseconds

### Security Test Results

- ✓ Green checkmark = Test passed (correct error handling)
- ✗ Red X = Test failed (security vulnerability detected)
- ⚠️ Warning = Unexpected behavior (may need investigation)

### Load Test Results

Key metrics to watch:
- **Success Rate**: Should be > 95%
- **Average Response Time**: Should be < 500ms
- **95th Percentile**: Should be < 1000ms
- **Requests per Second**: Higher is better

## Continuous Testing

### Add to package.json scripts:

```json
{
  "scripts": {
    "test:performance": "node test-performance.js",
    "test:security": "node test-security.js",
    "test:load": "node test-load.js",
    "test:all": "npm run test:performance && npm run test:security && npm run test:load"
  }
}
```

Then run:
```bash
npm run test:all
```

## Troubleshooting

### "fetch is not defined"

**Solution**: Install node-fetch or upgrade to Node.js 18+

```bash
npm install node-fetch
```

### "Cannot connect to API"

**Solution**: 
1. Make sure the server is running
2. Check the API_URL in the script matches your server
3. Verify firewall/network settings

### Tests timing out

**Solution**:
1. Check server logs for errors
2. Verify database connection
3. Check server resources (CPU, memory)
4. Reduce concurrent users in load test

## Advanced Testing

### Using Artillery for Advanced Load Testing

Install Artillery:
```bash
npm install -g artillery
```

Create `artillery-config.yml`:
```yaml
config:
  target: 'http://localhost:4000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "SOS Request"
    flow:
      - post:
          url: "/api/data-entries"
          json:
            name: "Load Test"
            message: "Test message"
            location: "28.6139, 77.2090"
```

Run:
```bash
artillery run artillery-config.yml
```

## Next Steps

1. Set up automated testing in CI/CD
2. Add monitoring and alerting
3. Create performance benchmarks
4. Set up regular load testing schedule
5. Document performance SLAs





