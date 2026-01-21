import { Router } from 'express';
import { getDb } from '../config/db.js';
import { containsSQLInjection, validateLength, validateRequired, sanitizeXSS } from '../utils/validation.js';

const router = Router();

// Constants for validation
const MAX_NAME_LENGTH = 255;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_LOCATION_LENGTH = 255;
const MAX_CONTACT_LENGTH = 255;

// Create
router.post('/', async (req, res, next) => {
  try {
    const { name, message, location, contact } = req.body;
    
    // Validate required fields
    const requiredCheck = validateRequired({ name, message });
    if (!requiredCheck.valid) {
      return res.status(400).json({ error: requiredCheck.error });
    }
    
    // Validate and check for SQL injection in name
    if (containsSQLInjection(name)) {
      return res.status(400).json({ error: 'Invalid characters detected in name field' });
    }
    const nameLengthCheck = validateLength('name', name, MAX_NAME_LENGTH);
    if (!nameLengthCheck.valid) {
      return res.status(400).json({ error: nameLengthCheck.error });
    }
    
    // Validate message length (XSS is sanitized but not rejected)
    const messageLengthCheck = validateLength('message', message, MAX_MESSAGE_LENGTH);
    if (!messageLengthCheck.valid) {
      return res.status(400).json({ error: messageLengthCheck.error });
    }
    
    // Validate optional fields
    if (location) {
      if (containsSQLInjection(location)) {
        return res.status(400).json({ error: 'Invalid characters detected in location field' });
      }
      const locationLengthCheck = validateLength('location', location, MAX_LOCATION_LENGTH);
      if (!locationLengthCheck.valid) {
        return res.status(400).json({ error: locationLengthCheck.error });
      }
    }
    
    if (contact) {
      if (containsSQLInjection(contact)) {
        return res.status(400).json({ error: 'Invalid characters detected in contact field' });
      }
      const contactLengthCheck = validateLength('contact', contact, MAX_CONTACT_LENGTH);
      if (!contactLengthCheck.valid) {
        return res.status(400).json({ error: contactLengthCheck.error });
      }
    }
    
    // Sanitize XSS in message (but still store it)
    const sanitizedMessage = sanitizeXSS(message);
    
    const db = getDb();
    const [result] = await db.execute(
      'INSERT INTO data_entries (name, message, location, contact) VALUES (?, ?, ?, ?)',
      [name, sanitizedMessage, location ?? null, contact ?? null]
    );
    const [rows] = await db.execute('SELECT * FROM data_entries WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// List
router.get('/', async (_req, res, next) => {
  try {
    const db = getDb();
    const [rows] = await db.execute('SELECT * FROM data_entries ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Get by id
router.get('/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const [rows] = await db.execute('SELECT * FROM data_entries WHERE id = ?', [req.params.id]);
    const entry = rows[0];
    if (!entry) return res.status(404).json({ error: 'Not Found' });
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

// Delete
router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const [result] = await db.execute('DELETE FROM data_entries WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not Found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;


