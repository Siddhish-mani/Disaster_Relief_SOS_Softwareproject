# How to View Database Data

## Method 1: Node.js Script (Easiest)
Run this command in the `server` folder:
```bash
node view_users.js
```

## Method 2: MySQL Command Line

### Step 1: Connect to MySQL
Open PowerShell and run:
```bash
mysql -u root -pSidpakaka@123 disaster_sos
```

### Step 2: Once connected, run SQL queries:
```sql
-- View all users
SELECT id, username, role, created_at FROM users;

-- View login attempts
SELECT * FROM login_attempts ORDER BY created_at DESC LIMIT 10;

-- View data entries
SELECT * FROM data_entries ORDER BY created_at DESC;
```

### Step 3: Exit MySQL
Type: `exit`

## Method 3: MySQL Workbench (GUI)
1. Open MySQL Workbench
2. Connect to localhost (root, password: Sidpakaka@123)
3. Select `disaster_sos` database
4. Run your queries in the query tab

## Quick Reference
- **Database name**: `disaster_sos`
- **Username**: `root`
- **Password**: `Sidpakaka@123`
- **Host**: `127.0.0.1`
- **Port**: `3306`












