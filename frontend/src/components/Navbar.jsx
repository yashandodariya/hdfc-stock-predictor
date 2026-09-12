import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, TrendingUp } from 'lucide-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Predict', href: '/predict' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'About ML', href: '/about-ml' },
    { name: 'History', href: '/history' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-tr from-rose-600 to-rose-400 p-1.5 rounded-lg shadow-lg group-hover:scale-105 transition-transform">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white select-none">
                HDFC <span className="text-rose-500 font-extrabold">Stock Predictor</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Nav Items */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-white bg-slate-900 border-b-2 border-rose-500 rounded-b-none'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <Link
                to="/predict"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-500 shadow-md hover:shadow-rose-600/30 transition-all font-semibold"
              >
                Predict Now
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-900 animate-slide-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href)
                    ? 'text-white bg-slate-900 text-rose-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-2 border-t border-slate-900 px-3">
              <Link
                to="/predict"
                onClick={() => setIsOpen(false)}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md text-white bg-rose-600 hover:bg-rose-500 shadow-md text-base font-semibold"
              >
                Predict Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
