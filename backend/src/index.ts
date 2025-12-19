import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { pool } from './db/index.js';
import authRoutes from './routes/auth.js';
import creatorRoutes from './routes/creator.js';
import contentRoutes from './routes/content.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';
import { initializeDatabase } from './db/schema.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Configure CORS to allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Serve static files with explicit route handler to avoid ORB issues
// Use catch-all route for uploads
app.get('/uploads/:filename(*)', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'uploads', filename);
  
  // Security: prevent directory traversal
  const resolvedPath = path.resolve(filePath);
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!resolvedPath.startsWith(uploadsDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Determine Content-Type based on file extension
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';

  // Set headers to prevent ORB blocking
  res.setHeader('Content-Type', contentType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=31536000');

  // Send file
  res.sendFile(filePath);
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Initialize database on startup
initializeDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

