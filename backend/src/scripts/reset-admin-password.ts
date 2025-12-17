import bcrypt from 'bcryptjs';
import { pool } from '../db/index.js';

async function resetAdminPassword() {
  const email = process.argv[2] || 'admin@fanhouse.com';
  const password = process.argv[3] || 'admin123';

  try {
    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Update the admin user's password
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, role = $2 WHERE email = $3 RETURNING id, email, role',
      [passwordHash, 'admin', email]
    );

    if (result.rows.length === 0) {
      // User doesn't exist, create it
      const createResult = await pool.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
        [email, passwordHash, 'admin']
      );
      console.log('Admin user created:', createResult.rows[0]);
    } else {
      console.log('Admin password reset:', result.rows[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
}

resetAdminPassword();

