import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserIcon, 
  PlusIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isDark, toggle } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path);

  const navLinkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'text-primary-600'
        : 'text-gray-700 hover:text-primary-600'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm glass dark:bg-secondary-900/60 dark:supports-[backdrop-filter]:bg-secondary-900/50 dark:border-secondary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-600 tracking-tight dark:text-primary-400">
                bendenotvar
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 flex-1 justify-center">
            <Link
              to="/"
              className={navLinkClass('/')}
            >
              Ana Sayfa
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/ads"
                  className={navLinkClass('/ads')}
                >
                  İlanlar
                </Link>
                <Link
                  to="/messages"
                  className={navLinkClass('/messages')}
                >
                  Mesajlar
                </Link>
                <Link
                  to="/favorites"
                  className={navLinkClass('/favorites')}
                >
                  Favoriler
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={navLinkClass('/admin')}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label="Tema Değiştir"
              className="px-2 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400"
              title={isDark ? 'Açık moda geç' : 'Karanlık moda geç'}
            >
              {isDark ? (
                <span className="inline-flex items-center">
                  {/* Sun icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0-1.414 1.414M7.05 16.95l-1.414 1.414M12 8.25A3.75 3.75 0 1 1 8.25 12 3.75 3.75 0 0 1 12 8.25z" />
                  </svg>
                </span>
              ) : (
                <span className="inline-flex items-center">
                  {/* Moon icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </span>
              )}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Quick Actions */}
                <Link
                  to="/ads"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md btn-ios-primary"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  İlanlar
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors dark:text-gray-200 dark:hover:text-primary-400"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center dark:bg-secondary-800">
                      <UserIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {user?.firstName} {user?.lastName}
                    </span>
                    {/* Dropdown arrow */}
                    <svg className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <>
                      {/* Backdrop to close menu */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl ring-1 ring-black/10 py-1 z-[60] animate-in fade-in slide-in-from-top-2 duration-200 dark:bg-secondary-800 dark:ring-white/10 border border-gray-200 dark:border-secondary-700">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-secondary-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            {user?.email}
                          </p>
                        </div>
                        
                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-200 dark:hover:bg-secondary-700"
                          >
                            <UserIcon className="h-4 w-4 mr-3" />
                            Profil
                          </Link>
                          <Link
                            to="/my-ads"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-200 dark:hover:bg-secondary-700"
                          >
                            <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            İlanlarım
                          </Link>
                          <Link
                            to="/favorites"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-200 dark:hover:bg-secondary-700"
                          >
                            <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Favoriler
                          </Link>
                          <Link
                            to="/messages"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-200 dark:hover:bg-secondary-700"
                          >
                            <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Mesajlar
                          </Link>
                          {user?.role === 'ADMIN' && (
                            <Link
                              to="/admin"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-200 dark:hover:bg-secondary-700"
                            >
                              <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                              </svg>
                              Admin Paneli
                            </Link>
                          )}
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-secondary-700 py-1">
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-950/40"
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                            Çıkış Yap
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-gray-200 dark:hover:text-primary-400"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t dark:border-secondary-800 dark:bg-secondary-900">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 dark:hover:text-primary-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/ads"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 dark:hover:text-primary-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    İlanlar
                  </Link>
                  <Link
                    to="/messages"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 dark:hover:text-primary-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Mesajlar
                  </Link>
                  <Link
                    to="/favorites"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 dark:hover:text-primary-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Favoriler
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 dark:hover:text-primary-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-red-600 hover:text-red-700 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 dark:hover:text-primary-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 dark:hover:text-primary-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Kayıt Ol
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-left text-gray-700 hover:text-primary-600 rounded-md text-base font-medium dark:text-gray-200 dark:hover:text-primary-400"
                    aria-label="Tema Değiştir"
                  >
                    <span onClick={toggle}>{isDark ? 'Açık Mod' : 'Karanlık Mod'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;


