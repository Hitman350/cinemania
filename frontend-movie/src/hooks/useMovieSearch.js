import { useContext } from 'react';
import { MovieContext } from '../context/MovieContext';

function useMovieSearch() {
  const { movies, loading, error, searchHistory, setMovies, setLoading, setError, addToHistory, clearSearchHistory, removeFromHistory } = useContext(MovieContext);

  const searchMovies = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setError('Please enter a movie title to search');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`http://localhost:5000/api/movies/search?query=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Something went wrong with the search');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        setError('No movies found matching your search');
        setMovies([]);
      } else {
        setMovies(data);
        addToHistory(searchTerm);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch movies');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return { movies, loading, error, searchHistory, searchMovies, clearSearchHistory, removeFromHistory };
}

export default useMovieSearch;