import bcrypt from 'bcryptjs';
import { pool } from '../db/index.js';

async function createAdmin() {
  const email = process.argv[2] || 'admin@fanhouse.com';
  const password = process.argv[3] || 'admin123';

  try {
    // Check if admin exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log('Admin user already exists');
      await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['admin', email]);
      console.log('Updated existing user to admin');
      process.exit(0);
    }

    // Create admin
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, passwordHash, 'admin']
    );

    console.log('Admin user created:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

