// Validation utilities for security

// SQL injection patterns to detect
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
  /('|(\\')|(;)|(--)|(\/\*)|(\*\/)|(\+)|(\%)|(\=))/,
  /(\bor\b|\band\b).*(\d+|\'|\")/i,
  /(\bunion\b).*(\bselect\b)/i,
];

// Check if input contains SQL injection patterns
export function containsSQLInjection(input) {
  if (typeof input !== 'string') return false;
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

// Validate input length
export function validateLength(field, value, maxLength) {
  if (typeof value !== 'string') return { valid: false, error: `${field} must be a string` };
  if (value.length > maxLength) {
    return { valid: false, error: `${field} must be less than ${maxLength} characters` };
  }
  return { valid: true };
}

// Validate required fields
export function validateRequired(fields) {
  const missing = [];
  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
  }
  return { valid: true };
}

// Sanitize XSS (basic - for display purposes)
export function sanitizeXSS(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}




