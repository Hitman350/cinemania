const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const movieRoutes = require('./routes/movies');
const authRoutes = require('./routes/auth');
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true, // Allow cookies
}));

app.use(express.json());

connectDB();

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));