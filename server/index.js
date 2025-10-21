const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adRoutes = require('./routes/ads');
const messageRoutes = require('./routes/messages');
const favoriteRoutes = require('./routes/favorites');
const statsRoutes = require('./routes/stats');
const adminRoutes = require('./routes/admin');
const { authenticateToken, requireAdmin, requireAdmin2FA } = require('./middleware/auth');
const { sitemapHandler } = require('./routes/sitemap');
const { initializeSocket } = require('./socket/socketHandler');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3000",
      "http://192.168.137.1:3000",
      "http://10.73.37.158:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Trust proxy (Nginx reverse proxy için)
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(cookieParser());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://192.168.137.1:3000",
    "http://10.73.37.158:3000"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));
// CSRF protection (double submit cookie) without external lib
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://192.168.137.1:3000",
  "http://10.73.37.158:3000",
  "https://bendenotvar.com.tr",
  "https://www.bendenotvar.com.tr"
];

app.get('/api/csrf-token', (req, res) => {
  const token = crypto.randomBytes(16).toString('hex');
  res.cookie('csrf_token', token, { httpOnly: false, sameSite: 'strict', secure: isProd, path: '/' });
  res.json({ token });
});

app.use((req, res, next) => {
  if (['POST','PUT','PATCH','DELETE'].includes(req.method)) {
    const origin = req.headers.origin || '';
    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({ message: 'Origin not allowed' });
    }
    const headerToken = req.headers['x-csrf-token'];
    const cookieToken = req.cookies['csrf_token'];
    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }
  }
  next();
});
// Handle preflight requests
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://192.168.137.1:3000",
    "http://10.73.37.158:3000"
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/favorites', authenticateToken, favoriteRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', authenticateToken, requireAdmin, requireAdmin2FA, adminRoutes);
app.get('/sitemap.xml', sitemapHandler);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Serve React build for non-API routes (SPA fallback)
try {
  const clientBuildPath = path.join(__dirname, '../client/build');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} catch (e) {
  // no-op if build path is not present (e.g., dev mode)
}


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize Socket.IO
initializeSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email domains allowed: ${process.env.ALLOWED_EMAIL_DOMAINS}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, server, io };

