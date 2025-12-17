import express from 'express';
import { pool } from '../db/index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { publishEvent } from '../utils/ably.js';

const router = express.Router();

// All admin routes require admin role
router.use(authenticate);
router.use(requireRole('admin'));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, role, created_at FROM users ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ users: result.rows });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get all creators
router.get('/creators', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.email, u.username
       FROM creators c
       JOIN users u ON c.user_id = u.id
       ORDER BY c.created_at DESC`
    );
    res.json({ creators: result.rows });
  } catch (error: any) {
    console.error('Get creators error:', error);
    res.status(500).json({ error: 'Failed to get creators' });
  }
});

// Approve creator
router.post('/creators/:id/approve', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE creators 
       SET verification_status = 'approved', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const creator = result.rows[0];

    // Get user ID for notification
    const userResult = await pool.query('SELECT user_id FROM creators WHERE id = $1', [req.params.id]);
    const userId = userResult.rows[0]?.user_id;

    // Publish real-time event
    await publishEvent('admin', 'creator_approved', {
      creatorId: creator.id,
      userId,
    });

    res.json({ creator });
  } catch (error: any) {
    console.error('Approve creator error:', error);
    res.status(500).json({ error: 'Failed to approve creator' });
  }
});

// Reject creator
router.post('/creators/:id/reject', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE creators 
       SET verification_status = 'rejected', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const creator = result.rows[0];

    // Get user ID for notification
    const userResult = await pool.query('SELECT user_id FROM creators WHERE id = $1', [req.params.id]);
    const userId = userResult.rows[0]?.user_id;

    // Publish real-time event
    await publishEvent('admin', 'creator_rejected', {
      creatorId: creator.id,
      userId,
    });

    res.json({ creator });
  } catch (error: any) {
    console.error('Reject creator error:', error);
    res.status(500).json({ error: 'Failed to reject creator' });
  }
});

// Get transactions (ledger)
router.get('/transactions', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const result = await pool.query(
      `SELECT l.*, 
              u1.email as fan_email, u1.username as fan_username,
              u2.email as creator_email, u2.username as creator_username
       FROM ledger l
       LEFT JOIN users u1 ON l.fan_id = u1.id
       LEFT JOIN creators c ON l.creator_id = c.id
       LEFT JOIN users u2 ON c.user_id = u2.id
       ORDER BY l.created_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json({ transactions: result.rows });
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Disable creator
router.post('/creators/:id/disable', async (req, res) => {
  try {
    // Disable all posts
    await pool.query(
      'UPDATE posts SET is_active = false WHERE creator_id = $1',
      [req.params.id]
    );

    // Update creator status (we can add a disabled flag if needed)
    const result = await pool.query(
      `UPDATE creators 
       SET verification_status = 'rejected', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    res.json({ creator: result.rows[0], message: 'Creator disabled' });
  } catch (error: any) {
    console.error('Disable creator error:', error);
    res.status(500).json({ error: 'Failed to disable creator' });
  }
});

// Disable post
router.post('/posts/:id/disable', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE posts 
       SET is_active = false, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post: result.rows[0], message: 'Post disabled' });
  } catch (error: any) {
    console.error('Disable post error:', error);
    res.status(500).json({ error: 'Failed to disable post' });
  }
});

export default router;

