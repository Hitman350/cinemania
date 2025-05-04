// MovieContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update localStorage when search history changes
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Add a search term to history
  const addToHistory = (term) => {
    if (!term.trim()) return;
    
    setSearchHistory(prev => {
      // Remove the term if it already exists
      const filtered = prev.filter(item => item !== term);
      // Add to the beginning of the array and limit to 10 items
      return [term, ...filtered].slice(0, 10);
    });
  };

  // Remove a term from history
  const removeFromHistory = (term) => {
    setSearchHistory(prev => prev.filter(item => item !== term));
  };

  // Clear all search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  const contextValue = {
    query,
    setQuery,
    movies,
    setMovies,
    selectedMovie,
    setSelectedMovie,
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearSearchHistory,
    loading,
    setLoading,
    error,
    setError
  };

  return (
    <MovieContext.Provider value={contextValue}>
      {children}
    </MovieContext.Provider>
  );
};