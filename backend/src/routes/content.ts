import express from 'express';
import { pool } from '../db/index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';
import { publishEvent } from '../utils/ably.js';
import { notifyNewPost } from '../utils/knock.js';

const router = express.Router();

// Create post
router.post('/', authenticate, requireRole('creator'), upload.single('media'), async (req: AuthRequest, res) => {
  try {
    const { title, content, access_type = 'public', ppv_price } = req.body;

    // Verify creator is approved
    const creatorResult = await pool.query(
      'SELECT id, verification_status FROM creators WHERE user_id = $1',
      [req.userId]
    );

    if (creatorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Creator profile not found' });
    }

    if (creatorResult.rows[0].verification_status !== 'approved') {
      return res.status(403).json({ error: 'Creator must be approved to create posts' });
    }

    const creatorId = creatorResult.rows[0].id;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const mediaType = req.file ? req.file.mimetype : null;

    // Validate access type
    if (!['public', 'subscriber', 'ppv'].includes(access_type)) {
      return res.status(400).json({ error: 'Invalid access type' });
    }

    if (access_type === 'ppv' && !ppv_price) {
      return res.status(400).json({ error: 'PPV price required for PPV posts' });
    }

    const result = await pool.query(
      `INSERT INTO posts (creator_id, title, content, media_url, media_type, access_type, ppv_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [creatorId, title || null, content || null, mediaUrl, mediaType, access_type, ppv_price || null]
    );

    const post = result.rows[0];

    // Publish real-time event
    await publishEvent('posts', 'new_post', {
      postId: post.id,
      creatorId,
      accessType: access_type,
    });

    // Notify subscribers if subscriber-only or public
    if (access_type !== 'ppv') {
      const subscribersResult = await pool.query(
        'SELECT fan_id FROM subscriptions WHERE creator_id = $1 AND status = $2',
        [creatorId, 'active']
      );
      const subscriberIds = subscribersResult.rows.map((r) => r.fan_id);
      await notifyNewPost(creatorId, post.id, subscriberIds);
    }

    res.json({ post });
  } catch (error: any) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get posts (with access control)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { creator_id, access_type } = req.query;

    let query = `
      SELECT p.*, p.creator_id, c.user_id as creator_user_id, u.username as creator_username
      FROM posts p
      JOIN creators c ON p.creator_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE p.is_active = true
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (creator_id) {
      query += ` AND p.creator_id = $${paramCount++}`;
      params.push(creator_id);
    }

    if (access_type) {
      query += ` AND p.access_type = $${paramCount++}`;
      params.push(access_type);
    }

    query += ' ORDER BY p.created_at DESC LIMIT 50';

    const result = await pool.query(query, params);
    const posts = result.rows;

    // Filter posts based on user access
    const filteredPosts = [];
    for (const post of posts) {
      if (post.access_type === 'public') {
        filteredPosts.push(post);
      } else if (post.access_type === 'subscriber' && req.userId) {
        // Check subscription
        const subResult = await pool.query(
          'SELECT id FROM subscriptions WHERE fan_id = $1 AND creator_id = $2 AND status = $3',
          [req.userId, post.creator_id, 'active']
        );
        if (subResult.rows.length > 0) {
          // User is subscribed - show full content
          filteredPosts.push(post);
        } else {
          // User not subscribed - show post but hide content
          filteredPosts.push({
            ...post,
            media_url: null,
            content: post.content ? '[Subscriber Only Content - Subscribe to view]' : null,
            _locked: true,
            _lockType: 'subscriber',
          });
        }
      } else if (post.access_type === 'subscriber' && !req.userId) {
        // Not logged in - show locked
        filteredPosts.push({
          ...post,
          media_url: null,
          content: post.content ? '[Subscriber Only Content - Subscribe to view]' : null,
          _locked: true,
          _lockType: 'subscriber',
        });
      } else if (post.access_type === 'ppv' && req.userId) {
        // Check PPV unlock
        const unlockResult = await pool.query(
          'SELECT id FROM ppv_unlocks WHERE fan_id = $1 AND post_id = $2',
          [req.userId, post.id]
        );
        if (unlockResult.rows.length > 0) {
          filteredPosts.push(post);
        } else {
          // Return post metadata but not media
          filteredPosts.push({
            ...post,
            media_url: null,
            content: post.content ? '[PPV Content - Unlock to view]' : null,
            _locked: true,
            _lockType: 'ppv',
          });
        }
      } else if (post.access_type === 'ppv' && !req.userId) {
        // Not logged in - show locked
        filteredPosts.push({
          ...post,
          media_url: null,
          content: post.content ? '[PPV Content - Unlock to view]' : null,
          _locked: true,
          _lockType: 'ppv',
        });
      }
    }

    res.json({ posts: filteredPosts });
  } catch (error: any) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// Get single post
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.user_id as creator_user_id, u.username as creator_username
       FROM posts p
       JOIN creators c ON p.creator_id = c.id
       JOIN users u ON c.user_id = u.id
       WHERE p.id = $1 AND p.is_active = true`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = result.rows[0];

    // Check access
    if (post.access_type === 'subscriber') {
      if (!req.userId) {
        return res.status(403).json({ 
          error: 'Subscription required',
          post: { ...post, media_url: null, content: '[Subscriber Only Content - Subscribe to view]' }
        });
      }
      const subResult = await pool.query(
        'SELECT id FROM subscriptions WHERE fan_id = $1 AND creator_id = $2 AND status = $3',
        [req.userId, post.creator_id, 'active']
      );
      if (subResult.rows.length === 0) {
        return res.status(403).json({ 
          error: 'Subscription required',
          post: { ...post, media_url: null, content: '[Subscriber Only Content - Subscribe to view]' }
        });
      }
    } else if (post.access_type === 'ppv') {
      if (!req.userId) {
        return res.status(403).json({ 
          error: 'PPV unlock required',
          post: { ...post, media_url: null, content: '[PPV Content - Unlock to view]' }
        });
      }
      const unlockResult = await pool.query(
        'SELECT id FROM ppv_unlocks WHERE fan_id = $1 AND post_id = $2',
        [req.userId, post.id]
      );
      if (unlockResult.rows.length === 0) {
        return res.status(403).json({ 
          error: 'PPV unlock required', 
          post: { ...post, media_url: null, content: '[PPV Content - Unlock to view]' }
        });
      }
    }

    res.json({ post });
  } catch (error: any) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

export default router;

