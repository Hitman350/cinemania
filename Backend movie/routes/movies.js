const express = require('express');
const axios = require('axios');
const { getDB } = require('../config/db');
require('dotenv').config();

const router = express.Router();

router.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const db = getDB();
    const cache = await db.collection('searches').findOne({ query });

    if (cache) {
      return res.json(cache.results);
    }

    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );

    const results = response.data.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      release_date: movie.release_date
    }));

    await db.collection('searches').insertOne({ query, results, timestamp: new Date() });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;