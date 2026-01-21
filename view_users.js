import 'dotenv/config';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

async function viewUsers() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DB || 'disaster_sos',
  });

  console.log('\n=== USERS ===');
  const [users] = await connection.execute('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
  console.table(users);

  console.log('\n=== LOGIN ATTEMPTS (Last 10) ===');
  const [attempts] = await connection.execute(
    'SELECT id, username, role, success, created_at FROM login_attempts ORDER BY created_at DESC LIMIT 10'
  );
  console.table(attempts);

  await connection.end();
}

viewUsers().catch(console.error);












