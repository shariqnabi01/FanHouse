import express from 'express';
import { pool } from '../db/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createSubscriptionCheckout, createPPVCheckout } from '../utils/ccbill.js';
import { addLedgerEntry } from '../utils/ledger.js';
import { publishEvent } from '../utils/ably.js';

const router = express.Router();

// Subscribe to creator
router.post('/subscribe', authenticate, async (req: AuthRequest, res) => {
  try {
    const { creator_id, amount = 9.99 } = req.body;

    if (!creator_id) {
      return res.status(400).json({ error: 'Creator ID required' });
    }

    // Verify creator exists and is approved
    const creatorResult = await pool.query(
      'SELECT id, verification_status FROM creators WHERE id = $1',
      [creator_id]
    );

    if (creatorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    if (creatorResult.rows[0].verification_status !== 'approved') {
      return res.status(400).json({ error: 'Creator is not approved' });
    }

    // Check if already subscribed (active subscription)
    const activeSub = await pool.query(
      'SELECT id, expires_at FROM subscriptions WHERE fan_id = $1 AND creator_id = $2 AND status = $3',
      [req.userId, creator_id, 'active']
    );

    if (activeSub.rows.length > 0) {
      const sub = activeSub.rows[0];
      const expiresAt = new Date(sub.expires_at);
      const now = new Date();
      
      // If subscription is still active, allow renewal (extend expiration)
      // This allows users to renew before expiration
      // If you want to block active subscriptions, uncomment below:
      // if (expiresAt > now) {
      //   return res.status(400).json({ 
      //     error: 'Already subscribed',
      //     subscription: {
      //       expires_at: sub.expires_at,
      //       days_remaining: Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      //     }
      //   });
      // }
    }

    // Get user email for Stripe customer
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
    const userEmail = userResult.rows[0]?.email;

    // Create checkout session (Stripe) or process mock payment
    let baseUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://fanhouse-frontend.onrender.com' : 'http://localhost:3000');
    
    // Ensure baseUrl has protocol
    if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }
    
    const successUrl = `${baseUrl}/payment/success?type=subscription&creator_id=${creator_id}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/creators`;

    console.log(`[Payment] Creating subscription checkout for creator ${creator_id}, amount: $${amount}`);
    const checkout = await createSubscriptionCheckout(
      req.userId!,
      creator_id,
      amount,
      userEmail,
      successUrl,
      cancelUrl
    );

    console.log(`[Payment] Checkout result:`, { 
      hasUrl: !!checkout.url, 
      url: checkout.url ? checkout.url.substring(0, 50) + '...' : null,
      sessionId: checkout.sessionId 
    });

    // If Stripe checkout URL is returned, redirect user to Stripe
    if (checkout.url) {
      console.log(`[Payment] Returning Stripe checkout URL`);
      // For Stripe, we'll handle subscription creation in the confirm endpoint
      // Store pending subscription info (in production, use Redis or database)
      return res.json({ checkoutUrl: checkout.url, sessionId: checkout.sessionId });
    }

    // Mock payment - create or update subscription
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

    // Check if subscription exists (might be expired)
    const existingSub = await pool.query(
      'SELECT id FROM subscriptions WHERE fan_id = $1 AND creator_id = $2',
      [req.userId, creator_id]
    );

    let subResult;
    if (existingSub.rows.length > 0) {
      // Update existing subscription
      subResult = await pool.query(
        `UPDATE subscriptions 
         SET status = 'active', expires_at = $1
         WHERE fan_id = $2 AND creator_id = $3
         RETURNING *`,
        [expiresAt, req.userId, creator_id]
      );
    } else {
      // Create new subscription
      subResult = await pool.query(
        `INSERT INTO subscriptions (fan_id, creator_id, status, expires_at)
         VALUES ($1, $2, 'active', $3)
         RETURNING *`,
        [req.userId, creator_id, expiresAt]
      );
    }

    // Add ledger entry
    await addLedgerEntry({
      transactionType: 'subscription',
      fanId: req.userId!,
      creatorId: creator_id,
      amount: parseFloat(amount),
      ccbillTransactionId: 'transactionId' in checkout ? checkout.transactionId : checkout.sessionId || 'unknown',
      metadata: { subscriptionId: subResult.rows[0].id },
    });

    // Publish real-time event
    await publishEvent('subscriptions', 'new_subscription', {
      fanId: req.userId,
      creatorId: creator_id,
      subscriptionId: subResult.rows[0].id,
    });

    res.json({ subscription: subResult.rows[0], payment: checkout });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unlock PPV post
router.post('/unlock-ppv', authenticate, async (req: AuthRequest, res) => {
  try {
    const { post_id } = req.body;

    if (!post_id) {
      return res.status(400).json({ error: 'Post ID required' });
    }

    // Get post
    const postResult = await pool.query(
      'SELECT id, creator_id, access_type, ppv_price FROM posts WHERE id = $1 AND is_active = true',
      [post_id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postResult.rows[0];

    if (post.access_type !== 'ppv') {
      return res.status(400).json({ error: 'Post is not PPV' });
    }

    if (!post.ppv_price) {
      return res.status(400).json({ error: 'PPV price not set' });
    }

    // Check if already unlocked
    const existingUnlock = await pool.query(
      'SELECT id FROM ppv_unlocks WHERE fan_id = $1 AND post_id = $2',
      [req.userId, post_id]
    );

    if (existingUnlock.rows.length > 0) {
      return res.status(400).json({ error: 'Already unlocked' });
    }

    // Get user email for Stripe customer
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
    const userEmail = userResult.rows[0]?.email;

    // Create checkout session (Stripe) or process mock payment
    let baseUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://fanhouse-frontend.onrender.com' : 'http://localhost:3000');
    
    // Ensure baseUrl has protocol
    if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }
    
    const successUrl = `${baseUrl}/payment/success?type=ppv&post_id=${post_id}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/feed`;

    const checkout = await createPPVCheckout(
      req.userId!,
      post_id,
      parseFloat(post.ppv_price),
      userEmail,
      successUrl,
      cancelUrl
    );

    // If Stripe checkout URL is returned, redirect user to Stripe
    if (checkout.url) {
      return res.json({ checkoutUrl: checkout.url, sessionId: checkout.sessionId });
    }

    // Mock payment - create unlock immediately
    const unlockResult = await pool.query(
      'INSERT INTO ppv_unlocks (fan_id, post_id) VALUES ($1, $2) RETURNING *',
      [req.userId, post_id]
    );

    // Add ledger entry
    await addLedgerEntry({
      transactionType: 'ppv_unlock',
      fanId: req.userId!,
      creatorId: post.creator_id,
      postId: post_id,
      amount: parseFloat(post.ppv_price),
      ccbillTransactionId: 'transactionId' in checkout ? checkout.transactionId : checkout.sessionId || 'unknown',
      metadata: { unlockId: unlockResult.rows[0].id },
    });

    // Publish real-time event
    await publishEvent('unlocks', 'ppv_unlocked', {
      fanId: req.userId,
      postId: post_id,
      creatorId: post.creator_id,
    });

    res.json({ unlock: unlockResult.rows[0], payment: checkout });
  } catch (error: any) {
    console.error('Unlock PPV error:', error);
    res.status(500).json({ error: 'Failed to unlock PPV' });
  }
});

// Confirm payment after Stripe redirect
router.post('/confirm', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId, type, post_id, creator_id } = req.body;

    if (type === 'ppv' && post_id) {
      // Check if already unlocked
      const existing = await pool.query(
        'SELECT id FROM ppv_unlocks WHERE fan_id = $1 AND post_id = $2',
        [req.userId, post_id]
      );

      if (existing.rows.length === 0) {
        // Get post details
        const postResult = await pool.query(
          'SELECT id, creator_id, ppv_price FROM posts WHERE id = $1',
          [post_id]
        );

        if (postResult.rows.length > 0) {
          const post = postResult.rows[0];
          
          // Create unlock
          const unlockResult = await pool.query(
            'INSERT INTO ppv_unlocks (fan_id, post_id) VALUES ($1, $2) RETURNING *',
            [req.userId, post_id]
          );

          // Add ledger entry
          await addLedgerEntry({
            transactionType: 'ppv_unlock',
            fanId: req.userId!,
            creatorId: post.creator_id,
            postId: post_id,
            amount: parseFloat(post.ppv_price),
            ccbillTransactionId: sessionId || `stripe_${Date.now()}`,
            metadata: { unlockId: unlockResult.rows[0].id },
          });

          await publishEvent('unlocks', 'ppv_unlocked', {
            fanId: req.userId,
            postId: post_id,
            creatorId: post.creator_id,
          });
        }
      }
    } else if (type === 'subscription' && creator_id) {
      // Check if subscription exists (might be expired)
      const existing = await pool.query(
        'SELECT id, expires_at FROM subscriptions WHERE fan_id = $1 AND creator_id = $2',
        [req.userId, creator_id]
      );

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const isRenewal = existing.rows.length > 0;
      let subResult;
      if (isRenewal) {
        // Update existing subscription (renewal)
        subResult = await pool.query(
          `UPDATE subscriptions 
           SET status = 'active', expires_at = $1
           WHERE fan_id = $2 AND creator_id = $3
           RETURNING *`,
          [expiresAt, req.userId, creator_id]
        );
      } else {
        // Create new subscription
        subResult = await pool.query(
          `INSERT INTO subscriptions (fan_id, creator_id, status, expires_at)
           VALUES ($1, $2, 'active', $3)
           RETURNING *`,
          [req.userId, creator_id, expiresAt]
        );
      }

      await addLedgerEntry({
        transactionType: 'subscription',
        fanId: req.userId!,
        creatorId: creator_id,
        amount: 9.99,
        ccbillTransactionId: sessionId || `stripe_${Date.now()}`,
        metadata: { subscriptionId: subResult.rows[0].id },
      });

      await publishEvent('subscriptions', isRenewal ? 'subscription_renewed' : 'new_subscription', {
        fanId: req.userId,
        creatorId: creator_id,
        subscriptionId: subResult.rows[0].id,
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get my subscriptions
router.get('/subscriptions', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, c.display_name, u.username as creator_username
       FROM subscriptions s
       JOIN creators c ON s.creator_id = c.id
       JOIN users u ON c.user_id = u.id
       WHERE s.fan_id = $1
       ORDER BY s.created_at DESC`,
      [req.userId]
    );

    res.json({ subscriptions: result.rows });
  } catch (error: any) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to get subscriptions' });
  }
});

export default router;

