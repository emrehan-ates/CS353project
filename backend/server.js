// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const { pool } = require('./db');

// Import Routes
const authRoutes = require('./routes/auth');
const adRoutes = require('./routes/ads');
const offerRoutes = require('./routes/offers');
const messageRoutes = require('./routes/messages');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection Test
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL Database'))
  .catch((err) => console.error('❌ Database Connection Error:', err));

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Routes
app.use('/auth', authRoutes);
app.use('/ads', adRoutes);
app.use('/offers', offerRoutes);
app.use('/messages', messageRoutes);
app.use('/payments', paymentRoutes);

// File Upload Route
app.post('/ads/upload-images', upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'expert_report', maxCount: 1 }
]), (req, res) => {
  res.status(200).json({ message: 'Files uploaded successfully!' });
});

// Root Endpoint
app.get('/', (req, res) => res.send('Server is Running!'));

// Start Server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
