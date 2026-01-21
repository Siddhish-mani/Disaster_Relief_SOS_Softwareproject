import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../config/db.js';
import { containsSQLInjection } from '../utils/validation.js';

const router = Router();

// Default admin credentials (for initial admin account)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123'; // Default password

// Signup endpoint
router.post('/signup', async (req, res, next) => {
  try {
    const { username, password, role = 'User' } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'username must be at least 3 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'password must be at least 6 characters' });
    }

    // Only allow User role for signup (Admin must be created by default or manually)
    const userRole = role === 'Admin' ? 'User' : role;

    const db = getDb();
    
    // Check if username already exists
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    await db.execute(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, passwordHash, userRole]
    );

    res.status(201).json({ success: true, message: 'User created successfully', username, role: userRole });
  } catch (err) {
    next(err);
  }
});

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'username, password, and role are required' });
    }

    // Check for SQL injection attempts - return 401 (unauthorized) for security
    if (containsSQLInjection(username) || containsSQLInjection(password) || containsSQLInjection(role)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const db = getDb();
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    let success = false;
    let message = 'Login failed';
    let userRole = role;

    // Check if user exists in database
    const [users] = await db.execute(
      'SELECT id, username, password_hash, role FROM users WHERE username = ?',
      [username]
    );

    if (users.length > 0) {
      // User exists, verify password
      const user = users[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      if (passwordMatch) {
        // Check if role matches
        if (user.role === role) {
          success = true;
          message = 'Login successful';
          userRole = user.role;
        } else {
          success = false;
          message = `Invalid role. This account is registered as ${user.role}`;
        }
      } else {
        success = false;
        message = 'Invalid password';
      }
    } else if (role === 'Admin') {
      // Fallback to default admin credentials if no user exists
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        success = true;
        message = 'Login successful (default admin)';
        userRole = 'Admin';
      } else {
        success = false;
        message = 'Invalid admin credentials';
      }
    } else {
      success = false;
      message = 'User not found. Please sign up first.';
    }

    // Log login attempt to database
    await db.execute(
      'INSERT INTO login_attempts (username, role, success, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      [username, role, success, ipAddress, userAgent]
    );

    if (success) {
      res.json({ success: true, message, role: userRole, username });
    } else {
      res.status(401).json({ success: false, message });
    }
  } catch (err) {
    next(err);
  }
});

// Get login attempts (for admin view)
router.get('/login-attempts', async (_req, res, next) => {
  try {
    const db = getDb();
    const [rows] = await db.execute(
      'SELECT * FROM login_attempts ORDER BY created_at DESC LIMIT 100'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;

