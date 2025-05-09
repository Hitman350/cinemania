const express = require('express');
const axios = require('axios');
const { getDB } = require('../config/db');
require('dotenv').config();

const router = express.Router();

// New endpoint to fetch genres
router.get('/genres', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}`
    );
    const genres = response.data.genres; // Returns [{ id: 28, name: "Action" }, ...]
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

router.get('/search', async (req, res) => {
  const { query, genre } = req.query; // Add genre parameter
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    if (!process.env.TMDB_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error: TMDB_API_KEY missing' });
    }

    const db = await getDB();
    const cacheKey = genre ? `${query}_${genre}` : query; // Unique cache key with genre
    const cache = await db.collection('searches').findOne({ cacheKey });

    if (cache && cache.results[0]?.rating) {
      return res.json(cache.results);
    }

    const searchResponse = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    ).catch(error => {
      throw new Error('Failed to fetch movies from TMDB');
    });

    let movies = searchResponse.data.results;

    // Filter by genre if provided
    if (genre) {
      const genreId = parseInt(genre);
      movies = movies.filter(movie => movie.genre_ids && movie.genre_ids.includes(genreId));
    }

    const movieDetailsPromises = movies.map(async (movie, index) => {
      try {
        await new Promise(resolve => setTimeout(resolve, index * 200));
        const detailsResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${process.env.TMDB_API_KEY}`
        );
        const details = detailsResponse.data;
        return {
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          release_date: movie.release_date,
          rating: details.vote_average,
          genres: details.genres ? details.genres.map(genre => genre.name) : [],
          runtime: details.runtime,
        };
      } catch (error) {
        return {
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          release_date: movie.release_date,
          rating: null,
          genres: [],
          runtime: null,
        };
      }
    });

    const results = await Promise.all(movieDetailsPromises);

    await db.collection('searches').insertOne({ cacheKey, results, timestamp: new Date() });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

router.get('/details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movie details', error: error.message });
  }
});

module.exports = router;