import { useState, useEffect, useRef } from 'react';
import { X, Star, Clock, Calendar, User, Tag, Globe, Play, ExternalLink, Heart, Share2, Bookmark, ChevronRight } from 'lucide-react';

const MovieModal = ({ movie, onClose }) => {
  const modalRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [movieDetails, setMovieDetails] = useState(null);
  const shareMenuRef = useRef(null);

  useEffect(() => {
    // Check if this movie is liked or bookmarked in localStorage
    const likedMovies = JSON.parse(localStorage.getItem('likedMovies') || '[]');
    const bookmarkedMovies = JSON.parse(localStorage.getItem('bookmarkedMovies') || '[]');
    
    setLiked(likedMovies.includes(movie.id));
    setBookmarked(bookmarkedMovies.includes(movie.id));

    // Fetch additional movie details including backdrop
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(`/api/movies/details/${movie.id}`);
        const data = await response.json();
        setMovieDetails(data);
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
      }
    };

    fetchMovieDetails();

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
      
      // Close share menu when clicking outside
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target) && 
          !e.target.closest('button[data-share-button="true"]')) {
        setShareOpen(false);
      }
    };

    document.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
      clearTimeout(timer);
    };
  }, [onClose, movie.id]);

  const posterUrl = movie.poster && !movie.poster.endsWith('null') ? movie.poster : '/placeholder.jpg';
  const backdropUrl = movieDetails?.backdrop_path_full || (movieDetails?.backdrop_path ? `https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}` : null);

  const truncateOverview = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  const handleLike = () => {
    const likedMovies = JSON.parse(localStorage.getItem('likedMovies') || '[]');
    
    if (liked) {
      // Remove movie from liked list
      const updatedLikes = likedMovies.filter(id => id !== movie.id);
      localStorage.setItem('likedMovies', JSON.stringify(updatedLikes));
    } else {
      // Add movie to liked list
      likedMovies.push(movie.id);
      localStorage.setItem('likedMovies', JSON.stringify(likedMovies));
      
      // Show a toast notification (if you have a toast system)
      if (window.showToast) {
        window.showToast(`Added ${movie.title} to your favorites!`);
      }
    }
    
    setLiked(!liked);
  };
  
  const handleBookmark = () => {
    const bookmarkedMovies = JSON.parse(localStorage.getItem('bookmarkedMovies') || '[]');
    
    if (bookmarked) {
      // Remove movie from bookmarked list
      const updatedBookmarks = bookmarkedMovies.filter(id => id !== movie.id);
      localStorage.setItem('bookmarkedMovies', JSON.stringify(updatedBookmarks));
    } else {
      // Add movie to bookmarked list
      bookmarkedMovies.push(movie.id);
      localStorage.setItem('bookmarkedMovies', JSON.stringify(bookmarkedMovies));
      
      // Show a toast notification (if you have a toast system)
      if (window.showToast) {
        window.showToast(`Added ${movie.title} to your watchlist!`);
      }
    }
    
    setBookmarked(!bookmarked);
  };
  
  const handleShare = () => {
    setShareOpen(!shareOpen);
  };
  
  const shareVia = async (platform) => {
    const shareData = {
      title: movie.title,
      text: `Check out "${movie.title}"${movie.tagline ? ` - ${movie.tagline}` : ''}`,
      url: `${window.location.origin}/movie/${movie.id}`
    };
    
    try {
      switch (platform) {
        case 'clipboard':
          await navigator.clipboard.writeText(shareData.url);
          if (window.showToast) {
            window.showToast('Link copied to clipboard!');
          }
          break;
        case 'native':
          if (navigator.share) {
            await navigator.share(shareData);
          }
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`, '_blank');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
    
    setShareOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all duration-300">
      {/* Full screen backdrop image */}
      {backdropUrl && (
        <div className="fixed inset-0 z-0">
          <img 
            src={backdropUrl} 
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60"></div>
        </div>
      )}
      
      <div 
        ref={modalRef}
        className={`relative flex flex-col md:flex-row w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-sm border border-gray-800 shadow-2xl transform transition-all duration-500 z-10 ${isLoaded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 blur-3xl rounded-full"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/80 backdrop-blur-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-colors z-10 group"
          aria-label="Close modal"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
        
        <div className="w-full md:w-2/5 relative overflow-hidden">
          <div className="relative h-64 md:h-full">
            <img 
              src={posterUrl} 
              alt={movie.title}
              className="w-full h-full object-cover transition-all duration-700 ease-in-out"
              style={{
                objectPosition: 'center 20%',
                filter: 'contrast(1.1) saturate(1.2)'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder.jpg';
              }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-gray-900/80"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent"></div>
            
            {movie.rating >= 8 && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-xs text-white font-medium tracking-wider flex items-center">
                <Star size={12} className="mr-1 fill-current" />
                FEATURED
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-6 md:hidden">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {movie.title}
                </h2>
                {movie.tagline && (
                  <p className="text-sm italic text-gray-300">{movie.tagline}</p>
                )}
                {!movie.tagline && movieDetails?.tagline && (
                  <p className="text-sm italic text-gray-300">{movieDetails.tagline}</p>
                )}
              </div>
            </div>
          </div>
          
          {(movie.trailerUrl || (movieDetails?.videos?.results && movieDetails.videos.results.length > 0)) && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:block hidden">
              <a 
                href={movie.trailerUrl || `https://www.youtube.com/watch?v=${movieDetails.videos.results[0].key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm border border-white/30 text-white hover:bg-purple-600/80 transition-all duration-300 group"
                aria-label="Watch trailer"
              >
                <Play size={24} className="ml-1 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto backdrop-blur-sm bg-gray-900/50">
          <div className="p-6 md:p-8">
            <div className="hidden md:block space-y-2 mb-6">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {movie.title}
              </h2>
              {movie.tagline && (
                <p className="text-sm italic text-gray-300">{movie.tagline}</p>
              )}
              {!movie.tagline && movieDetails?.tagline && (
                <p className="text-sm italic text-gray-300">{movieDetails.tagline}</p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 mb-8">
              {(movie.rating || movieDetails?.vote_average) && (
                <div className="flex items-center bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <Star size={18} className="text-amber-400 fill-current" />
                  <span className="ml-2 font-medium">{movie.rating || (movieDetails?.vote_average?.toFixed(1))}/10</span>
                </div>
              )}
              
              {(movie.releaseYear || movie.release_date || movieDetails?.release_date) && (
                <div className="flex items-center text-gray-300 bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <Calendar size={18} className="mr-1" />
                  <span>
                    {movie.releaseYear || 
                     (movie.release_date ? new Date(movie.release_date).getFullYear() : '') || 
                     (movieDetails?.release_date ? new Date(movieDetails.release_date).getFullYear() : '')}
                  </span>
                </div>
              )}
              
              {(movie.runtime || movieDetails?.runtime) && (
                <div className="flex items-center text-gray-300 bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <Clock size={18} className="mr-1" />
                  <span>{movie.runtime || movieDetails?.runtime} min</span>
                </div>
              )}
              
              {(movie.language || movieDetails?.original_language) && (
                <div className="flex items-center text-gray-300 bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <Globe size={18} className="mr-1" />
                  <span>{movie.language || movieDetails?.original_language?.toUpperCase()}</span>
                </div>
              )}
            </div>
            
            {(movie.overview || movieDetails?.overview) && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                  Overview
                  <span className="h-px w-16 bg-gradient-to-r from-purple-500 to-transparent ml-3"></span>
                </h3>
                <div className="relative">
                  <p className="text-gray-300 leading-relaxed">
                    {showFullOverview 
                      ? (movie.overview || movieDetails?.overview) 
                      : truncateOverview(movie.overview || movieDetails?.overview)}
                  </p>
                  {(movie.overview?.length > 200 || (movieDetails?.overview && movieDetails.overview.length > 200)) && (
                    <button 
                      onClick={() => setShowFullOverview(!showFullOverview)}
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-2 flex items-center transition-colors"
                    >
                      {showFullOverview ? 'Show Less' : 'Read More'}
                      <ChevronRight size={16} className={`ml-1 transition-transform duration-300 ${showFullOverview ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {((movie.genres && movie.genres.length > 0) || (movieDetails?.genres && movieDetails.genres.length > 0)) && (
                <div className="space-y-3">
                  <div className="flex items-center text-gray-200">
                    <Tag size={16} className="mr-2 text-purple-400" />
                    <h3 className="text-sm font-medium">Genres</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(movie.genres || (movieDetails?.genres?.map(g => g.name) || [])).map((genre, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-purple-800/70 text-gray-300 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/30 transition-colors cursor-pointer"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {((movie.cast && movie.cast.length > 0) || (movieDetails?.credits?.cast && movieDetails.credits.cast.length > 0)) && (
                <div className="space-y-3">
                  <div className="flex items-center text-gray-200">
                    <User size={16} className="mr-2 text-purple-400" />
                    <h3 className="text-sm font-medium">Cast</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(movie.cast || (movieDetails?.credits?.cast?.slice(0, 5).map(c => c.name) || [])).slice(0, 5).map((actor, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-purple-800/70 text-gray-300 backdrop-blur-sm border border-gray-700/50"
                      >
                        {actor}
                      </span>
                    ))}
                    {(movie.cast?.length > 5 || (movieDetails?.credits?.cast?.length > 5)) && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800/70 text-gray-300 backdrop-blur-sm border border-gray-700/50">
                        +{(movie.cast?.length || movieDetails?.credits?.cast?.length) - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-auto border-t border-gray-800/50 backdrop-blur-sm">
            <div className="p-4 md:p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex space-x-2 relative">
                <button 
                  onClick={handleLike}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    liked 
                      ? 'bg-red-500/20 text-red-500' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/80'
                  }`}
                  aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
                  title={liked ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={20} className={liked ? 'fill-current' : ''} />
                </button>
                
                <button 
                  onClick={handleBookmark}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    bookmarked 
                      ? 'bg-purple-500/20 text-purple-500' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/80'
                  }`}
                  aria-label={bookmarked ? 'Remove from watchlist' : 'Add to watchlist'}
                  title={bookmarked ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  <Bookmark size={20} className={bookmarked ? 'fill-current' : ''} />
                </button>
                
                <div className="relative">
                  <button 
                    onClick={handleShare}
                    data-share-button="true"
                    className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
                    aria-label="Share movie"
                    title="Share movie"
                  >
                    <Share2 size={20} />
                  </button>
                  
                  {shareOpen && (
                    <div 
                      ref={shareMenuRef}
                      className="absolute bottom-12 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 w-48 animate-fadeIn z-20"
                    >
                      <div className="px-3 py-1 text-xs text-gray-400 font-medium uppercase tracking-wider">
                        Share via
                      </div>
                      <button 
                        onClick={() => shareVia('clipboard')}
                        className="flex items-center w-full px-3 py-2 hover:bg-gray-700 text-gray-200 text-sm"
                      >
                        <span className="mr-2">📋</span> Copy Link
                      </button>
                      {navigator.share && (
                        <button 
                          onClick={() => shareVia('native')}
                          className="flex items-center w-full px-3 py-2 hover:bg-gray-700 text-gray-200 text-sm"
                        >
                          <span className="mr-2">📱</span> Share...
                        </button>
                      )}
                      <button 
                        onClick={() => shareVia('twitter')}
                        className="flex items-center w-full px-3 py-2 hover:bg-gray-700 text-gray-200 text-sm"
                      >
                        <span className="mr-2">𝕏</span> Twitter
                      </button>
                      <button 
                        onClick={() => shareVia('facebook')}
                        className="flex items-center w-full px-3 py-2 hover:bg-gray-700 text-gray-200 text-sm"
                      >
                        <span className="mr-2">📘</span> Facebook
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800/80 hover:text-white transition-all"
                >
                  Close
                </button>
                {(movie.trailerUrl || (movieDetails?.videos?.results && movieDetails.videos.results.length > 0)) && (
                  <a 
                    href={movie.trailerUrl || `https://www.youtube.com/watch?v=${movieDetails.videos.results[0].key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-500 hover:to-blue-500 transition-all flex items-center"
                  >
                    <Play size={18} className="mr-2" />
                    Watch Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;