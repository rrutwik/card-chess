import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogOut, User, Sun, Moon, Monitor, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  showBackButton?: boolean;
  backTo?: string;
  title?: string;
  onToggleRules?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  showBackButton = false,
  backTo = '/',
  title = 'Card Chess',
  onToggleRules
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme, actualTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(actualTheme === 'light' ? 'dark' : 'light');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor className="w-4 h-4" />;
    return theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />;
  };

  // Memoize theme icon title to avoid recalculation
  const themeIconTitle = useMemo(() => {
    if (theme === 'system') {
      return `Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`;
    }
    return `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`;
  }, [theme, actualTheme]);

  // Reusable button class for consistent styling
  const buttonClass = "p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors";
  const navLinkClass = "px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors";

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Back button and logo */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {showBackButton && (
              <button
                onClick={() => navigate(backTo)}
                className={buttonClass}
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <motion.span
                className="text-lg sm:text-xl lg:text-2xl select-none flex-shrink-0"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
              >
                ♔
              </motion.span>
              <Link
                to="/"
                className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity truncate min-w-0"
                title={title}
              >
                {title}
              </Link>
            </div>
          </div>

          {/* Center section - Navigation (desktop only) */}
          <nav className="hidden md:flex items-center gap-1" role="navigation">
            <Link to="/" className={navLinkClass}>Home</Link>
            <Link to="/games" className={navLinkClass}>Games</Link>
            <Link to="/history" className={navLinkClass}>History</Link>
          </nav>

          {/* Right section - Controls and user info */}
          <div className="flex items-center gap-2">
            {/* Rules button */}
            {onToggleRules && (
              <button
                onClick={onToggleRules}
                className={buttonClass}
                title="Toggle Rules"
                aria-label="Toggle game rules"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={buttonClass}
              title={themeIconTitle}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {getThemeIcon()}
            </button>

            {isAuthenticated ? (
              <>
                {/* User info - mobile */}
                <div className="md:hidden">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || user.email || "User"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>

                {/* User info - desktop */}
                <div className="hidden md:flex items-center gap-3">
                  {user?.picture && (
                    <img
                      src={user.picture}
                      alt={user.name || user.email || "User"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium text-foreground max-w-32 truncate">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </span>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Logout"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
