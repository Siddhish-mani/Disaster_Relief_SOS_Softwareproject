-- View all users
SELECT id, username, role, created_at, updated_at FROM users ORDER BY created_at DESC;

-- View login attempts
SELECT id, username, role, success, created_at FROM login_attempts ORDER BY created_at DESC LIMIT 20;












