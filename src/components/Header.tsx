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
  const isDark = actualTheme === 'dark';

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

  const themeIconTitle = useMemo(() => {
    if (theme === 'system') {
      return `Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`;
    }
    return `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`;
  }, [theme, actualTheme]);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: isDark ? 'rgba(30, 30, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
      transition: 'all 0.3s ease',
      boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          {/* Left section - Back button and logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            minWidth: 0,
            flex: 1
          }}>
            {showBackButton && (
              <button
                onClick={() => navigate(backTo)}
                style={{
                  padding: '8px',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = isDark ? '#f9fafb' : '#1f2937';
                  e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isDark ? '#9ca3af' : '#6b7280';
                  e.currentTarget.style.background = 'transparent';
                }}
                aria-label="Go back"
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: 0
            }}>
              <motion.span
                style={{
                  fontSize: '28px',
                  userSelect: 'none',
                  flexShrink: 0,
                  lineHeight: 1
                }}
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
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  background: 'linear-gradient(90deg, #667eea 0%, #a855f7 50%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                title={title}
              >
                {title}
              </Link>
            </div>
          </div>

          {/* Center section - Navigation (desktop only) */}
          <nav style={{
            display: 'none',
            alignItems: 'center',
            gap: '4px'
          }} className="md-nav" role="navigation">
            <style>{`
              @media (min-width: 768px) {
                .md-nav {
                  display: flex !important;
                }
              }
              .nav-link {
                padding: 8px 12px;
                font-size: 14px;
                font-weight: 500;
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                background: transparent;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                display: inline-block;
              }
              .nav-link:hover {
                color: ${isDark ? '#f9fafb' : '#1f2937'};
                background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6'};
              }
            `}</style>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/games" className="nav-link">Games</Link>
            <Link to="/history" className="nav-link">History</Link>
          </nav>

          {/* Right section - Controls and user info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {/* Rules button */}
            {onToggleRules && (
              <button
                onClick={onToggleRules}
                style={{
                  padding: '8px',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = isDark ? '#f9fafb' : '#1f2937';
                  e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isDark ? '#9ca3af' : '#6b7280';
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Toggle Rules"
                aria-label="Toggle game rules"
              >
                <BookOpen style={{ width: '16px', height: '16px' }} />
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                padding: '8px',
                color: isDark ? '#9ca3af' : '#6b7280',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = isDark ? '#f9fafb' : '#1f2937';
                e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = isDark ? '#9ca3af' : '#6b7280';
                e.currentTarget.style.background = 'transparent';
              }}
              title={themeIconTitle}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {getThemeIcon()}
            </button>

            {isAuthenticated ? (
              <>
                {/* User info - desktop */}
                <div style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: '12px'
                }} className="user-info-desktop">
                  <style>{`
                    @media (min-width: 768px) {
                      .user-info-desktop {
                        display: flex !important;
                      }
                      .user-info-mobile {
                        display: none !important;
                      }
                    }
                  `}</style>
                  {user?.picture && (
                    <img
                      src={user.picture}
                      alt={user.first_name || user.email || "User"}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`
                      }}
                    />
                  )}
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: isDark ? '#f9fafb' : '#1f2937',
                    maxWidth: '128px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user?.first_name || user?.email?.split('@')[0] || 'User'}
                  </span>
                </div>

                {/* User info - mobile */}
                <div className="user-info-mobile">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.first_name || user.email || "User"}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User style={{ width: '16px', height: '16px', color: '#667eea' }} />
                    </div>
                  )}
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px',
                    color: '#ef4444',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#dc2626';
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.background = 'transparent';
                  }}
                  title="Logout"
                  aria-label="Sign out"
                >
                  <LogOut style={{ width: '20px', height: '20px' }} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                }}
              >
                <User style={{ width: '16px', height: '16px' }} />
                <span style={{ display: 'none' }} className="login-text">Login</span>
                <style>{`
                  @media (min-width: 640px) {
                    .login-text {
                      display: inline !important;
                    }
                  }
                `}</style>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
