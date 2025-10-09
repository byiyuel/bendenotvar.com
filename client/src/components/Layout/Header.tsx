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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={navLinkClass('/')}
            >
              Ana Sayfa
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/ads/create"
                  className={navLinkClass('/ads/create')}
                >
                  İlan Ekle
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
                  to="/ads/create"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md btn-ios-primary"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  İlan Ekle
                </Link>

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors dark:text-gray-200 dark:hover:text-primary-400">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center dark:bg-secondary-800">
                      <UserIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black/5 py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 dark:bg-secondary-800 dark:ring-white/10">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-200 dark:hover:bg-secondary-700"
                    >
                      Profil
                    </Link>
                    <Link
                      to="/my-ads"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-200 dark:hover:bg-secondary-700"
                    >
                      İlanlarım
                    </Link>
                    <Link
                      to="/favorites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-200 dark:hover:bg-secondary-700"
                    >
                      Favoriler
                    </Link>
                    <Link
                      to="/messages"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-200 dark:hover:bg-secondary-700"
                    >
                      Mesajlar
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-950/40"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 inline mr-2" />
                      Çıkış Yap
                    </button>
                  </div>
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
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t dark:border-secondary-800 dark:bg-secondary-900">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 dark:hover:text-primary-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/ads/create"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 dark:hover:text-primary-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    İlan Ekle
                  </Link>
                  <Link
                    to="/messages"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 dark:hover:text-primary-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mesajlar
                  </Link>
                  <Link
                    to="/favorites"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 dark:hover:text-primary-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Favoriler
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 dark:hover:text-primary-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
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
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 dark:hover:text-primary-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Kayıt Ol
                  </Link>
                  <button
                    onClick={() => setIsMenuOpen(false)}
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


