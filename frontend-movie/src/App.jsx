import { useState, useContext, useEffect } from 'react';
import { Search, X, Film, Zap, LayoutGrid, TrendingUp, Clock, History } from 'lucide-react';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import SearchHistory from './components/SearchHistory';
import { MovieContext } from './context/MovieContext';
import useMovieSearch from './hooks/useMovieSearch';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [gridLayout, setGridLayout] = useState('grid');
  
  // Get state from MovieContext
  const { 
    movies = [], // Default to empty array to avoid undefined
    loading, 
    error, 
    searchHistory = [], // Default to empty array
    clearSearchHistory, 
    removeFromHistory 
  } = useContext(MovieContext);
  
  // Get searchMovies from useMovieSearch
  const { searchMovies } = useMovieSearch();

  // Apply animation to movie cards with delay
  useEffect(() => {
    const movieElements = document.querySelectorAll('.movie-appear');
    movieElements.forEach((el, index) => {
      el.style.animationDelay = `${index * 0.1}s`;
    });
  }, [movies]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchMovies(searchTerm);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const openMovieDetails = (movie) => {
    setSelectedMovie(movie);
  };

  const closeMovieDetails = () => {
    setSelectedMovie(null);
  };

  const toggleGridLayout = () => {
    setGridLayout(gridLayout === 'grid' ? 'list' : 'grid');
  };

  return (
    <div className="flex flex-col min-h-screen text-gray-100 relative overflow-hidden">
      {/* Futuristic Background */}
      <div className="futuristic-bg">
        <div className="grid-overlay"></div>
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
      </div>
      
      <header className="header-wrapper px-4 py-6 sticky top-0 z-50 backdrop-blur flex justify-center w-full">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center md:flex-row md:justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="relative logo-container">
                <Film size={28} className="text-cyan-400 mr-3 logo-glow" />
                <h1 className="text-3xl md:text-4xl font-bold title-gradient title-glow tracking-wider">
                  CINE<span className="font-light">SEARCH</span>
                </h1>
              </div>
            </div>
            
            <div className="w-full md:w-2/3 relative">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyUp={handleKeyPress}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search for movies..."
                  className={`w-full py-4 pl-12 pr-12 rounded-full glass search-input ${searchFocused ? 'ring-2 ring-cyan-400/50' : ''}`}
                />
                <div 
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 transition-all duration-300 ${searchFocused ? 'scale-110' : ''}`}
                >
                  <Search size={20} />
                </div>
                
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
                
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-1.5 rounded-full hover:shadow-glow transition-all"
                >
                  <Zap size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow px-4 pb-12 pt-6 relative z-10 flex justify-center w-full">
        <div className="container mx-auto max-w-6xl">
          <SearchHistory 
            searchHistory={searchHistory} 
            clearSearchHistory={clearSearchHistory} 
            removeFromHistory={removeFromHistory}
            searchMovies={searchMovies}
          />

          <section className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <TrendingUp size={20} className="mr-2 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">
                  {searchTerm ? `Results for "${searchTerm}"` : "Trending Movies"}
                </h2>
              </div>
              
              <button 
                onClick={toggleGridLayout}
                className="p-2 rounded-lg glass hover:bg-gray-700/50 transition-colors"
                title="Toggle view"
              >
                <LayoutGrid size={20} className="text-cyan-400" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="cyber-loader"></div>
              </div>
            ) : error ? (
              <div className="glass rounded-lg p-6 text-center border border-red-500/20">
                <p className="text-red-300">{error}</p>
              </div>
            ) : movies.length > 0 ? (
              <div className={`${gridLayout === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6' 
                : 'flex flex-col space-y-4'}`}>
                {movies.map((movie, index) => (
                  <div key={movie.id} className="movie-appear" style={{animationDelay: `${index * 0.05}s`}}>
                    <MovieCard 
                      movie={movie} 
                      onClick={() => openMovieDetails(movie)}
                      layoutMode={gridLayout}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass rounded-lg p-8 text-center no-results">
                <div className="flex flex-col items-center">
                  <Film size={48} className="text-gray-500 mb-4" />
                  <p className="text-gray-300 mb-2">No movies found</p>
                  <p className="text-gray-400 text-sm">Try a different search term or check back later</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="px-4 py-5 backdrop-blur-md bg-black/30 border-t border-gray-800/50 relative z-10 flex justify-center w-full">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-3 md:mb-0">
            <Clock size={14} className="text-cyan-400 mr-2" />
            <p className="text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex items-center">
            <History size={14} className="text-cyan-400 mr-2" />
            <p className="text-gray-400 text-sm">{searchHistory.length} searches this session</p>
          </div>
        </div>
      </footer>

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={closeMovieDetails} />
      )}
    </div>
  );
}

export default App;