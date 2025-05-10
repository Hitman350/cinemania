import { useState, useEffect } from 'react';
import { X, Search, Heart, Bookmark, Loader2, Film } from 'lucide-react';

const MyMovies = ({ onClose, onSelectMovie }) => {
  const [activeTab, setActiveTab] = useState('liked');
  const [likedMovies, setLikedMovies] = useState([]);
  const [bookmarkedMovies, setBookmarkedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moviesData, setMoviesData] = useState({
    liked: [],
    bookmarked: []
  });
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    // Get movie IDs from localStorage
    const likedIds = JSON.parse(localStorage.getItem('likedMovies') || '[]');
    const bookmarkedIds = JSON.parse(localStorage.getItem('bookmarkedMovies') || '[]');
    
    setLikedMovies(likedIds);
    setBookmarkedMovies(bookmarkedIds);
    
    // Fetch movie details
    const fetchMoviesData = async () => {
      try {
        // Fetch liked movies
        const likedMoviesData = await Promise.all(
          likedIds.map(id => fetchMovieDetails(id))
        );
        
        // Fetch bookmarked movies
        const bookmarkedMoviesData = await Promise.all(
          bookmarkedIds.map(id => fetchMovieDetails(id))
        );
        
        setMoviesData({
          liked: likedMoviesData.filter(movie => movie !== null),
          bookmarked: bookmarkedMoviesData.filter(movie => movie !== null)
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setIsLoading(false);
      }
    };
    
    fetchMoviesData();
  }, []);
  
  // Function to fetch movie details by ID
  const fetchMovieDetails = async (id) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/movies/details/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch movie details');
      }
      
      const data = await response.json();
      
      // Convert API response to the format your app uses
      return {
        id: data.id,
        title: data.title,
        overview: data.overview,
        poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
        releaseYear: data.release_date ? new Date(data.release_date).getFullYear() : null,
        rating: data.vote_average,
        runtime: data.runtime,
        genres: data.genres ? data.genres.map(genre => genre.name) : [],
        tagline: data.tagline || ''
      };
    } catch (error) {
      console.error(`Error fetching movie ${id}:`, error);
      return null;
    }
  };
  
  const removeMovie = (id, type) => {
    setRemoving(id);
    
    setTimeout(() => {
      if (type === 'liked') {
        const updatedLikes = likedMovies.filter(movieId => movieId !== id);
        localStorage.setItem('likedMovies', JSON.stringify(updatedLikes));
        setLikedMovies(updatedLikes);
        setMoviesData({
          ...moviesData,
          liked: moviesData.liked.filter(movie => movie.id !== id)
        });
      } else {
        const updatedBookmarks = bookmarkedMovies.filter(movieId => movieId !== id);
        localStorage.setItem('bookmarkedMovies', JSON.stringify(updatedBookmarks));
        setBookmarkedMovies(updatedBookmarks);
        setMoviesData({
          ...moviesData,
          bookmarked: moviesData.bookmarked.filter(movie => movie.id !== id)
        });
      }
      
      // Show toast notification
      if (window.showToast) {
        window.showToast('Movie removed');
      }
      
      setRemoving(null);
    }, 300);
  };
  
  const getFilteredMovies = () => {
    const movies = moviesData[activeTab] || [];
    
    if (!searchTerm) return movies;
    
    const term = searchTerm.toLowerCase();
    return movies.filter(movie => 
      movie.title.toLowerCase().includes(term) || 
      (movie.overview && movie.overview.toLowerCase().includes(term)) ||
      (movie.genres && movie.genres.some(genre => genre.toLowerCase().includes(term)))
    );
  };
  
  const filteredMovies = getFilteredMovies();

  // Format the movie rating for display
  const formatRating = (rating) => {
    if (!rating) return null;
    // Just return the rating directly to match your UI
    return rating.toFixed(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg">
      <div 
        className="w-full max-w-6xl max-h-[90vh] bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl overflow-hidden flex flex-col shadow-2xl shadow-purple-900/20 animate-fadeIn border border-gray-800"
        style={{animation: 'fadeIn 0.3s ease-out'}}
      >
        {/* Header with title and close button */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-800/80">
          <h2 className="text-2xl font-semibold text-white flex items-center">
            <Film size={20} className="mr-3 text-purple-400" />
            My Movies
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Tabs with increased spacing */}
        <div className="px-8 flex space-x-8 items-center border-b border-gray-800/50 py-4">
          <button 
            className={`flex items-center py-2 px-1 relative transition-all duration-300 ${
              activeTab === 'liked' 
                ? 'text-purple-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('liked')}
          >
            <Heart 
              size={18} 
              className={`mr-2 transition-all duration-300 ${
                activeTab === 'liked' ? 'fill-purple-500 text-purple-500' : ''
              }`} 
            />
            Favorites ({moviesData.liked.length})
            {activeTab === 'liked' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" />
            )}
          </button>
          <button 
            className={`flex items-center py-2 px-1 relative transition-all duration-300 ${
              activeTab === 'bookmarked' 
                ? 'text-purple-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('bookmarked')}
          >
            <Bookmark 
              size={18} 
              className={`mr-2 transition-all duration-300 ${
                activeTab === 'bookmarked' ? 'fill-purple-500 text-purple-500' : ''
              }`} 
            />
            Watchlist ({moviesData.bookmarked.length})
            {activeTab === 'bookmarked' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" />
            )}
          </button>
        </div>
        
        {/* Search with increased spacing */}
        <div className="px-8 py-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search your movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/70 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        
        {/* Content - movie grid with increased spacing */}
        <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 size={32} className="animate-spin text-purple-500 mb-4" />
              <p className="text-gray-400">Loading your movies...</p>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-600 text-6xl mb-8 opacity-75">
                {activeTab === 'liked' ? '❤️' : '🔖'}
              </div>
              <h3 className="text-xl font-medium text-gray-300 mb-4">
                {searchTerm ? 'No matches found' : `No ${activeTab === 'liked' ? 'favorite' : 'watchlist'} movies yet`}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try a different search term or clear your search'
                  : activeTab === 'liked' 
                    ? 'Like movies by clicking the heart icon when viewing movie details'
                    : 'Add movies to your watchlist by clicking the bookmark icon when viewing movie details'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMovies.map(movie => (
                <div 
                  key={movie.id} 
                  className={`group relative bg-gray-800/40 rounded-lg overflow-hidden border border-gray-700/50 hover:border-purple-500/70 hover:shadow-lg hover:shadow-purple-700/10 transition-all duration-300 ${
                    removing === movie.id ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                  }`}
                >
                  <div 
                    className="h-56 relative cursor-pointer overflow-hidden"
                    onClick={() => {
                      onSelectMovie(movie);
                      onClose();
                    }}
                  >
                    {movie.poster ? (
                      <img 
                        src={movie.poster} 
                        alt={movie.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <Film size={40} className="text-gray-600" />
                      </div>
                    )}
                    
                    {/* Rating badge - Updated to match UI */}
                    {movie.rating && (
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium flex items-center text-yellow-400">
                        <svg className="w-3 h-3 mr-1 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        {formatRating(movie.rating)}
                      </div>
                    )}
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMovie(movie.id, activeTab);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                      title={`Remove from ${activeTab === 'liked' ? 'favorites' : 'watchlist'}`}
                    >
                      <X size={14} />
                    </button>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                      <h3 className="text-white font-medium truncate">{movie.title}</h3>
                      {movie.releaseYear && (
                        <div className="text-gray-400 text-sm mt-1">{movie.releaseYear}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick view on hover with increased spacing */}
                  <div className="p-4 border-t border-gray-700/50">
                    <div className="flex items-center text-xs text-gray-400 space-x-3">
                      {movie.genres && movie.genres.length > 0 && (
                        <span className="truncate">{movie.genres.slice(0, 2).join(', ')}</span>
                      )}
                      {movie.runtime && (
                        <span className="flex-shrink-0">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                      )}
                    </div>
                    <div className="mt-3 hidden group-hover:block">
                      <button
                        onClick={() => {
                          onSelectMovie(movie);
                          onClose();
                        }}
                        className="w-full bg-purple-600/80 hover:bg-purple-600 text-white text-sm py-1.5 rounded-md transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer - removed "showing x movies" message as requested */}
        <div className="px-8 py-4 border-t border-gray-800/80 bg-gray-900/50">
          <div className="text-sm text-gray-500">
            {!isLoading && searchTerm && filteredMovies.length === 0 && (
              <p>No results found for "{searchTerm}"</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyMovies;