require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.use('/api/feedback', feedbackRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map(item => item.message).join(' ') });
  }
  res.status(500).json({ message: 'Something went wrong on the server. Check the backend terminal.' });
});

async function start() {
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('YOUR_USERNAME')) {
    console.error('Set a real MongoDB Atlas URI in backend/.env before starting the server.');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');
  app.listen(PORT, () => console.log(`FeedbackFlow API listening on http://localhost:${PORT}`));
}
start().catch(error => {
  console.error('Could not connect to MongoDB Atlas:', error.message);
  process.exit(1);
});
