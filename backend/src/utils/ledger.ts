import { pool } from '../db/index.js';

export interface LedgerEntry {
  transactionType: string;
  fanId?: string;
  creatorId?: string;
  postId?: string;
  amount: number;
  currency?: string;
  status?: string;
  ccbillTransactionId?: string;
  metadata?: any;
}

export async function addLedgerEntry(entry: LedgerEntry) {
  const {
    transactionType,
    fanId,
    creatorId,
    postId,
    amount,
    currency = 'USD',
    status = 'completed',
    ccbillTransactionId,
    metadata,
  } = entry;

  const result = await pool.query(
    `INSERT INTO ledger (
      transaction_type, fan_id, creator_id, post_id, 
      amount, currency, status, ccbill_transaction_id, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [transactionType, fanId || null, creatorId || null, postId || null, amount, currency, status, ccbillTransactionId || null, metadata ? JSON.stringify(metadata) : null]
  );

  return result.rows[0];
}

export async function getLedgerEntries(filters: {
  fanId?: string;
  creatorId?: string;
  transactionType?: string;
  limit?: number;
}) {
  let query = 'SELECT * FROM ledger WHERE 1=1';
  const params: any[] = [];
  let paramCount = 1;

  if (filters.fanId) {
    query += ` AND fan_id = $${paramCount++}`;
    params.push(filters.fanId);
  }

  if (filters.creatorId) {
    query += ` AND creator_id = $${paramCount++}`;
    params.push(filters.creatorId);
  }

  if (filters.transactionType) {
    query += ` AND transaction_type = $${paramCount++}`;
    params.push(filters.transactionType);
  }

  query += ' ORDER BY created_at DESC';

  if (filters.limit) {
    query += ` LIMIT $${paramCount++}`;
    params.push(filters.limit);
  }

  const result = await pool.query(query, params);
  return result.rows;
}

