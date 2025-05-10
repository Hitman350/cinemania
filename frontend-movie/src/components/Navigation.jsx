import { useState } from 'react';
import { Menu, X, User, Search } from 'lucide-react';

function Navigation({ user, onLoginClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg border-b border-gray-700/30">
      <div className="container mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and site name */}
          <div className="flex items-center">
            <div className="flex items-center mr-8">
              {/* Logo is now only in Navigation component */}
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wider">
                CINE<span className="font-light">SEARCH</span>
              </h1>
            </div>
          </div>
          
          {/* Right Side - User/Search */}
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-800 hover:text-cyan-300 transition-colors">
                <Search size={20} />
              </button>
              
              {user ? (
                <button className="flex items-center space-x-2 py-1.5 px-4 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-colors shadow-md">
                  <User size={16} />
                  <span className="text-sm font-medium">{user.username}</span>
                </button>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="py-1.5 px-4 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-colors shadow-md text-sm font-medium"
                >
                  Login
                </button>
              )}
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 hover:text-cyan-300 transition-colors" 
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-sm border-t border-gray-700">
          <div className="container mx-auto px-4 py-3 space-y-4">
            {/* Mobile login/user button */}
            <div className="mb-4 py-2 border-b border-gray-700/50">
              {user ? (
                <button className="flex items-center space-x-2 py-1.5 px-4 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 w-full justify-center">
                  <User size={16} />
                  <span className="text-sm font-medium">{user.username}</span>
                </button>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="py-1.5 px-4 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 w-full text-sm font-medium"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;