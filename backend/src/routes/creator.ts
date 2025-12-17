import express from 'express';
import { pool } from '../db/index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { createInquiry } from '../utils/persona.js';
import { publishEvent } from '../utils/ably.js';

const router = express.Router();

// Apply to become creator
router.post('/apply', authenticate, async (req: AuthRequest, res) => {
  try {
    // Check if already has a creator record
    const existingCreator = await pool.query(
      'SELECT id FROM creators WHERE user_id = $1',
      [req.userId]
    );

    if (existingCreator.rows.length > 0) {
      return res.status(400).json({ error: 'Already a creator' });
    }

    // Create Persona inquiry
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
    const email = userResult.rows[0]?.email;
    const inquiry = await createInquiry(req.userId!, email);

    // Create creator record
    const result = await pool.query(
      `INSERT INTO creators (user_id, verification_status, persona_inquiry_id, bio, display_name)
       VALUES ($1, 'pending', $2, $3, $4)
       RETURNING *`,
      [req.userId, inquiry.id, req.body.bio || null, req.body.display_name || null]
    );

    // Update user role
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['creator', req.userId]);

    // Notify admin via Ably
    await publishEvent('admin', 'creator_application', {
      creatorId: result.rows[0].id,
      userId: req.userId,
    });

    res.json({ creator: result.rows[0] });
  } catch (error: any) {
    console.error('Creator application error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get all approved creators (public endpoint)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.email, u.username
       FROM creators c
       JOIN users u ON c.user_id = u.id
       WHERE c.verification_status = 'approved'
       ORDER BY c.created_at DESC`
    );

    res.json({ creators: result.rows });
  } catch (error: any) {
    console.error('Get creators error:', error);
    res.status(500).json({ error: 'Failed to get creators' });
  }
});

// Get creator profile
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.email, u.username
       FROM creators c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    res.json({ creator: result.rows[0] });
  } catch (error: any) {
    console.error('Get creator error:', error);
    res.status(500).json({ error: 'Failed to get creator' });
  }
});

// Get my creator profile
router.get('/me/profile', authenticate, requireRole('creator'), async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.email, u.username
       FROM creators c
       JOIN users u ON c.user_id = u.id
       WHERE c.user_id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Creator profile not found' });
    }

    // Get stats
    const statsResult = await pool.query(
      `SELECT 
        COUNT(DISTINCT s.id) as subscriber_count,
        COUNT(DISTINCT p.id) as post_count
       FROM creators c
       LEFT JOIN subscriptions s ON s.creator_id = c.id AND s.status = 'active'
       LEFT JOIN posts p ON p.creator_id = c.id AND p.is_active = true
       WHERE c.id = $1
       GROUP BY c.id`,
      [result.rows[0].id]
    );

    const creator = result.rows[0];
    creator.stats = statsResult.rows[0] || { subscriber_count: 0, post_count: 0 };

    res.json({ creator });
  } catch (error: any) {
    console.error('Get creator profile error:', error);
    res.status(500).json({ error: 'Failed to get creator profile' });
  }
});

export default router;

