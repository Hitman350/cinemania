import { useState, useEffect } from 'react';
import { Star, Clock, Calendar, Award, Eye, Heart, Info } from 'lucide-react';

const MovieCard = ({ movie, onClick, layoutMode = 'grid' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check if the poster URL is valid
  const posterUrl = movie.poster && !movie.poster.endsWith('null') ? movie.poster : '/placeholder.jpg';

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Use data directly from the movie prop
  const rating = movie.rating ? movie.rating.toFixed(1) : 'N/A';
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'N/A';
  const runtime = movie.runtime || 'N/A';
  const genres = movie.genres || [];

  const isGridLayout = layoutMode === 'grid';

  if (isGridLayout) {
    return (
      <div
        className="movie-card relative rounded-xl overflow-hidden cursor-pointer neon-border"
        onClick={() => onClick(movie)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="card-glow"></div>
        <div className="aspect-[2/3] overflow-hidden relative">
          {/* Placeholder/shimmer while image loads */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 shimmer"></div>
          )}

          {/* Fallback image */}
          {imageError ? (
            <div className="flex items-center justify-center h-full glass text-gray-400">
              <div className="text-center px-3">
                <Eye size={24} className="mx-auto mb-2 opacity-50" />
                <span className="text-sm">Image not available</span>
              </div>
            </div>
          ) : (
            <img
              src={posterUrl}
              alt={movie.title}
              className={`movie-card-image w-full h-full object-cover transition-transform duration-700 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )}

          {/* Top rating badge */}
          <div className="absolute top-2 right-2 flex items-center bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 z-10">
            <Star size={14} className="text-yellow-400 fill-yellow-400 star-rating" />
            <span className="ml-1 text-xs font-medium text-white">{rating}</span>
          </div>

          {/* Info overlay */}
          <div className="movie-card-overlay absolute inset-0 p-4 flex flex-col justify-end">
            <div className="space-y-2">
              <h3 className="font-semibold text-white text-lg leading-tight">{movie.title}</h3>

              {genres.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {genres.slice(0, 2).map((genre, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 bg-gray-800/80 backdrop-blur-sm rounded-full text-cyan-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-3 text-xs text-gray-300 pt-1">
                <div className="flex items-center">
                  <Calendar size={12} className="mr-1 text-cyan-400" />
                  <span>{releaseYear}</span>
                </div>

                {runtime !== 'N/A' && (
                  <div className="flex items-center">
                    <Clock size={12} className="mr-1 text-cyan-400" />
                    <span>{runtime} min</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hover action button */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              className="cyber-button text-sm py-2 px-4 flex items-center space-x-2 transform transition hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                onClick(movie);
              }}
            >
              <Info size={16} />
              <span>View Details</span>
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    // List layout view
    return (
      <div
        className="movie-card glass rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:bg-gray-800/50"
        onClick={() => onClick(movie)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex">
          {/* Movie poster thumbnail */}
          <div className="w-24 h-36 relative flex-shrink-0">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 shimmer"></div>
            )}

            {imageError ? (
              <div className="flex items-center justify-center h-full text-gray-400 bg-gray-800/50">
                <Eye size={20} className="opacity-50" />
              </div>
            ) : (
              <img
                src={posterUrl}
                alt={movie.title}
                className={`w-full h-full object-cover ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            )}
          </div>

          {/* Movie info */}
          <div className="p-3 flex-grow">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-white text-lg">{movie.title}</h3>
              <div className="flex items-center bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="ml-1 text-xs font-medium text-white">{rating}</span>
              </div>
            </div>

            <div className="mt-2 flex items-center space-x-3 text-xs text-gray-300">
              <div className="flex items-center">
                <Calendar size={12} className="mr-1 text-cyan-400" />
                <span>{releaseYear}</span>
              </div>

              {runtime !== 'N/A' && (
                <div className="flex items-center">
                  <Clock size={12} className="mr-1 text-cyan-400" />
                  <span>{runtime} min</span>
                </div>
              )}

              {movie.award && (
                <div className="flex items-center">
                  <Award size={12} className="mr-1 text-cyan-400" />
                  <span>{movie.award}</span>
                </div>
              )}
            </div>

            {genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {genres.slice(0, 3).map((genre, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 bg-gray-800/80 backdrop-blur-sm rounded-full text-cyan-300"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {movie.overview && (
              <p className="mt-2 text-xs text-gray-400 line-clamp-2">{movie.overview}</p>
            )}
          </div>

          {/* Action button */}
          <div className="flex items-center pr-4">
            <button
              className={`p-2 rounded-full transition-all duration-300 ${
                isHovered ? 'bg-cyan-500/20 text-cyan-400' : 'bg-transparent text-gray-500'
              }`}
            >
              <Info size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default MovieCard;