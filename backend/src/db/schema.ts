import { pool } from './index.js';

export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'fan',
        username VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Creators table
    await client.query(`
      CREATE TABLE IF NOT EXISTS creators (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        verification_status VARCHAR(20) DEFAULT 'pending',
        persona_inquiry_id VARCHAR(255),
        bio TEXT,
        display_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
        title VARCHAR(255),
        content TEXT,
        media_url VARCHAR(500),
        media_type VARCHAR(50),
        access_type VARCHAR(20) NOT NULL DEFAULT 'public',
        ppv_price DECIMAL(10, 2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        fan_id UUID REFERENCES users(id) ON DELETE CASCADE,
        creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'active',
        started_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // PPV unlocks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ppv_unlocks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        fan_id UUID REFERENCES users(id) ON DELETE CASCADE,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        unlocked_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(fan_id, post_id)
      )
    `);

    // Ledger table (append-only)
    await client.query(`
      CREATE TABLE IF NOT EXISTS ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_type VARCHAR(50) NOT NULL,
        fan_id UUID REFERENCES users(id),
        creator_id UUID REFERENCES creators(id),
        post_id UUID REFERENCES posts(id),
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        status VARCHAR(20) DEFAULT 'completed',
        ccbill_transaction_id VARCHAR(255),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);
      CREATE INDEX IF NOT EXISTS idx_creators_status ON creators(verification_status);
      CREATE INDEX IF NOT EXISTS idx_posts_creator_id ON posts(creator_id);
      CREATE INDEX IF NOT EXISTS idx_posts_access_type ON posts(access_type);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_fan_id ON subscriptions(fan_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_creator_id ON subscriptions(creator_id);
      CREATE INDEX IF NOT EXISTS idx_ledger_fan_id ON ledger(fan_id);
      CREATE INDEX IF NOT EXISTS idx_ledger_creator_id ON ledger(creator_id);
      CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON ledger(created_at);
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

