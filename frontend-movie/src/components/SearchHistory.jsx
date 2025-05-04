import { X, Clock, Trash2 } from 'lucide-react';

const SearchHistory = ({ searchHistory, clearSearchHistory, removeFromHistory, searchMovies }) => {
  if (!searchHistory || searchHistory.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center text-gray-300">
          <Clock size={16} className="mr-2" />
          <h3 className="text-sm font-medium">Recent Searches</h3>
        </div>
        
        <button
          onClick={clearSearchHistory}
          className="flex items-center text-xs text-gray-400 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} className="mr-1" />
          <span>Clear All</span>
        </button>
      </div>
      
      <div className="flex flex-wrap items-center">
        {searchHistory.map((term, index) => (
          <div 
            key={`${term}-${index}`}
            className="search-tag group"
          >
            <span 
              className="cursor-pointer"
              onClick={() => searchMovies(term)}
            >
              {term}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFromHistory(term);
              }}
              className="ml-2 text-gray-400 group-hover:text-gray-200"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;