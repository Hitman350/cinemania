import { Clock, History } from 'lucide-react';

function Footer({ searchHistoryLength }) {
  return (
    <footer className="px-4 py-5 bg-gradient-to-r from-indigo-900 to-slate-900 border-t-2 border-cyan-400/50 relative z-10 flex justify-center w-full shadow-xl shadow-cyan-500/10">
      <div className="container mx-auto max-w-6xl">
        {/* Current session info */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center mb-3 md:mb-0">
            <Clock size={14} className="text-cyan-400 mr-2" />
            <p className="text-gray-100 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex items-center">
            <History size={14} className="text-cyan-400 mr-2" />
            <p className="text-gray-100 text-sm">{searchHistoryLength} searches this session</p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6 border-t border-cyan-500/20">
          {/* Logo column */}
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wider">
                CINE<span className="font-light">SEARCH</span>
              </h2>
              <p className="mt-3 text-gray-100 text-sm">Your ultimate destination for discovering movies across all genres and eras.</p>
            </div>
          </div>

          {/* THE BASICS column */}
          <div>
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">THE BASICS</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-200 hover:text-cyan-300 transition-colors">About CineSearch</a></li>
              <li><a href="#" className="text-gray-200 hover:text-cyan-300 transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-200 hover:text-cyan-300 transition-colors">Support Forums</a></li>
              <li><a href="#" className="text-gray-200 hover:text-cyan-300 transition-colors">API Documentation</a></li>
              <li><a href="#" className="text-gray-200 hover:text-cyan-300 transition-colors">System Status</a></li>
            </ul>
          </div>

          {/* GET INVOLVED column */}
          <div>
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">GET INVOLVED</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-200 hover:text-cyan-300 transition-colors">Contribution Guide</a></li>
              <li><a href="#" className="text-gray-200 hover:text-cyan-300 transition-colors">Add New Movie</a></li>
              <li><a href="#" className="text-gray-200 hover:text-cyan-300 transition-colors">Add New TV Show</a></li>
            </ul>
          </div>

          {/* LEGAL column */}
          <div>
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">LEGAL</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-200 hover:text-cyan-300 transition-colors">Terms of Use</a></li>
              <li><a href="#" className="text-gray-200 hover:text-cyan-300 transition-colors">API Terms of Use</a></li>
              <li><a href="#" className="text-gray-200 hover:text-cyan-300 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-200 hover:text-cyan-300 transition-colors">DMCA Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} CineSearch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;