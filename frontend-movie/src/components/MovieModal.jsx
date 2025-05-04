import { useState, useEffect, useRef } from 'react';
import { X, Star, Clock, Calendar, User, Tag, Globe, Play, ExternalLink, Heart, Share2, Bookmark, ChevronRight } from 'lucide-react';

const MovieModal = ({ movie, onClose }) => {
  const modalRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    // Animation timing
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
      clearTimeout(timer);
    };
  }, [onClose]);

  // Check if the poster URL is valid
  const posterUrl = movie.poster && !movie.poster.endsWith('null') ? movie.poster : '/placeholder.jpg';

  // Truncate overview for initial display
  const truncateOverview = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all duration-300">
      <div 
        ref={modalRef}
        className={`relative flex flex-col md:flex-row w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 shadow-2xl transform transition-all duration-500 ${isLoaded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 blur-3xl rounded-full"></div>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/80 backdrop-blur-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-colors z-10 group"
          aria-label="Close modal"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
        
        {/* Movie poster - left side */}
        <div className="w-full md:w-2/5 relative overflow-hidden">
          {/* Poster image with gradient overlay */}
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
            
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-gray-900"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent"></div>
            
            {/* Movie badge - only for special movies */}
            {movie.rating >= 8 && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-xs text-white font-medium tracking-wider flex items-center">
                <Star size={12} className="mr-1 fill-current" />
                FEATURED
              </div>
            )}
            
            {/* Mobile title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:hidden">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {movie.title}
                </h2>
                {movie.tagline && (
                  <p className="text-sm italic text-gray-300">{movie.tagline}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Trailer button overlay - centered on the poster */}
          {movie.trailerUrl && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:block hidden">
              <a 
                href={movie.trailerUrl}
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
        
        {/* Movie details - right side */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Main content area */}
          <div className="p-6 md:p-8">
            {/* Desktop title */}
            <div className="hidden md:block space-y-2 mb-6">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {movie.title}
              </h2>
              {movie.tagline && (
                <p className="text-sm italic text-gray-300">{movie.tagline}</p>
              )}
            </div>
            
            {/* Movie stats with animated bars */}
            <div className="flex flex-wrap gap-4 mb-8">
              {movie.rating && (
                <div className="flex items-center bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <Star size={18} className="text-amber-400 fill-current" />
                  <span className="ml-2 font-medium">{movie.rating}/10</span>
                </div>
              )}
              
              {movie.releaseYear && (
                <div className="flex items-center text-gray-300 bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <Calendar size={18} className="mr-1" />
                  <span>{movie.releaseYear}</span>
                </div>
              )}
              
              {movie.runtime && (
                <div className="flex items-center text-gray-300 bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <Clock size={18} className="mr-1" />
                  <span>{movie.runtime} min</span>
                </div>
              )}
              
              {movie.language && (
                <div className="flex items-center text-gray-300 bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <Globe size={18} className="mr-1" />
                  <span>{movie.language}</span>
                </div>
              )}
            </div>
            
            {/* Overview with read more toggle */}
            {movie.overview && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                  Overview
                  <span className="h-px w-16 bg-gradient-to-r from-purple-500 to-transparent ml-3"></span>
                </h3>
                <div className="relative">
                  <p className="text-gray-300 leading-relaxed">
                    {showFullOverview ? movie.overview : truncateOverview(movie.overview)}
                  </p>
                  {movie.overview.length > 200 && (
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
            
            {/* Extra details - 2 columns on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center text-gray-200">
                    <Tag size={16} className="mr-2 text-purple-400" />
                    <h3 className="text-sm font-medium">Genres</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800/70 text-gray-300 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/30 transition-colors cursor-pointer"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Cast */}
              {movie.cast && movie.cast.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center text-gray-200">
                    <User size={16} className="mr-2 text-purple-400" />
                    <h3 className="text-sm font-medium">Cast</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {movie.cast.slice(0, 5).map((actor, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800/70 text-gray-300 backdrop-blur-sm border border-gray-700/50"
                      >
                        {actor}
                      </span>
                    ))}
                    {movie.cast.length > 5 && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800/70 text-gray-300 backdrop-blur-sm border border-gray-700/50">
                        +{movie.cast.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons footer */}
          <div className="mt-auto border-t border-gray-800/50 backdrop-blur-sm">
            <div className="p-4 md:p-6 flex flex-wrap items-center justify-between gap-4">
              {/* Social/action buttons */}
              <div className="flex space-x-2">
                <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors">
                  <Heart size={20} />
                </button>
                <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors">
                  <Bookmark size={20} />
                </button>
                <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
              
              {/* Main action buttons */}
              <div className="flex space-x-3">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800/80 hover:text-white transition-all"
                >
                  Close
                </button>
                {movie.trailerUrl && (
                  <a 
                    href={movie.trailerUrl}
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