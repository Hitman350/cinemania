const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const movieRoutes = require('./routes/movies');

const app = express();

// Configure CORS to allow requests from the frontend (Vite port 5173)
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

connectDB();

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.use('/api/movies', movieRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));