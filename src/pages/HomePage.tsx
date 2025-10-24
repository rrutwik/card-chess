import React from 'react';
import { motion } from 'motion/react';
import { Play, Users, Crown, Swords, Zap, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export const HomePage: React.FC = () => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(180deg, #0f0f1e 0%, #1a1a2e 50%, #0f0f1e 100%)'
        : 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 50%, #f8f9ff 100%)',
      color: isDark ? '#f9fafb' : '#1f2937',
      transition: 'all 0.3s ease',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <Header />

      {/* Background decorative elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: isDark 
            ? 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '10%',
          width: '350px',
          height: '350px',
          background: isDark 
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
      </div>

      <main style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1024px',
        margin: '0 auto',
        padding: '64px 16px'
      }}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            marginBottom: '64px'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            <motion.div
              animate={{ 
                rotate: [0, -5, 5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut"
              }}
            >
              <Crown style={{ 
                width: '48px', 
                height: '48px', 
                color: '#667eea',
                filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.4))'
              }} />
            </motion.div>
            <h1 style={{
              fontSize: 'clamp(32px, 8vw, 56px)',
              fontWeight: '800',
              color: isDark ? '#f9fafb' : '#1f2937',
              margin: 0,
              letterSpacing: '-1px'
            }}>
              Card Chess
            </h1>
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <Swords style={{ 
                width: '48px', 
                height: '48px', 
                color: '#a855f7',
                filter: 'drop-shadow(0 4px 8px rgba(168, 85, 247, 0.4))'
              }} />
            </motion.div>
          </div>
          
          <p style={{
            fontSize: '18px',
            color: isDark ? '#d1d5db' : '#6b7280',
            maxWidth: '600px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            Play chess with cards. Strategy meets chance in this exciting twist on the classic game.
          </p>

          {/* Feature badges */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '24px'
          }}>
            {[
              { icon: '⚡', text: 'Fast-paced' },
              { icon: '🎯', text: 'Strategic' },
              { icon: '🎲', text: 'Unpredictable' }
            ].map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: isDark 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(102, 126, 234, 0.08)',
                  borderRadius: '24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isDark ? '#e5e7eb' : '#4b5563',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.2)'}`
                }}
              >
                <span style={{ fontSize: '16px' }}>{badge.icon}</span>
                <span>{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Game Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {/* New Game Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              position: 'relative'
            }}
          >
            <Link
              to="/play"
              style={{
                display: 'block',
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.2)'}`,
                borderRadius: '24px',
                padding: '40px 32px',
                textDecoration: 'none',
                boxShadow: isDark 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(102, 126, 234, 0.15)',
                transition: 'all 0.3s ease',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = isDark 
                  ? '0 12px 48px rgba(0, 0, 0, 0.4)'
                  : '0 12px 48px rgba(102, 126, 234, 0.25)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isDark 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(102, 126, 234, 0.15)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.2)';
              }}
            >
              {/* Gradient overlay on hover */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none'
              }} className="card-overlay"></div>
              <style>{`
                a:hover .card-overlay {
                  opacity: 1;
                }
              `}</style>

              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                style={{
                  width: '72px',
                  height: '72px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <Play style={{ width: '36px', height: '36px', color: 'white' }} />
              </motion.div>

              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: isDark ? '#f9fafb' : '#1f2937',
                marginBottom: '12px',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
              }}>
                New Game
              </h3>
              <p style={{
                fontSize: '15px',
                color: isDark ? '#d1d5db' : '#6b7280',
                textAlign: 'center',
                lineHeight: '1.6',
                margin: 0,
                position: 'relative',
                zIndex: 1
              }}>
                Start a new game
              </p>
            </Link>
          </motion.div>

          {/* Active Games Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              position: 'relative'
            }}
          >
            <Link
              to="/games"
              style={{
                display: 'block',
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(168, 85, 247, 0.2)'}`,
                borderRadius: '24px',
                padding: '40px 32px',
                textDecoration: 'none',
                boxShadow: isDark 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(168, 85, 247, 0.15)',
                transition: 'all 0.3s ease',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = isDark 
                  ? '0 12px 48px rgba(0, 0, 0, 0.4)'
                  : '0 12px 48px rgba(168, 85, 247, 0.25)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isDark 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(168, 85, 247, 0.15)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(168, 85, 247, 0.2)';
              }}
            >
              {/* Gradient overlay on hover */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none'
              }} className="card-overlay-2"></div>
              <style>{`
                a:hover .card-overlay-2 {
                  opacity: 1;
                }
              `}</style>

              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ duration: 0.3 }}
                style={{
                  width: '72px',
                  height: '72px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <Users style={{ width: '36px', height: '36px', color: 'white' }} />
              </motion.div>

              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: isDark ? '#f9fafb' : '#1f2937',
                marginBottom: '12px',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
              }}>
                Active Games
              </h3>
              <p style={{
                fontSize: '15px',
                color: isDark ? '#d1d5db' : '#6b7280',
                textAlign: 'center',
                lineHeight: '1.6',
                margin: 0,
                position: 'relative',
                zIndex: 1
              }}>
                Join ongoing games or continue your matches
              </p>
            </Link>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            textAlign: 'center',
            marginTop: '64px',
            padding: '32px',
            background: isDark 
              ? 'rgba(255, 255, 255, 0.03)' 
              : 'rgba(102, 126, 234, 0.05)',
            borderRadius: '20px',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(102, 126, 234, 0.15)'}`
          }}
        >
          <Trophy style={{ 
            width: '40px', 
            height: '40px', 
            color: '#fbbf24',
            margin: '0 auto 16px',
            filter: 'drop-shadow(0 4px 8px rgba(251, 191, 36, 0.4))'
          }} />
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: isDark ? '#f9fafb' : '#1f2937',
            marginBottom: '8px'
          }}>
            Ready to Master the Board?
          </h3>
          <p style={{
            fontSize: '15px',
            color: isDark ? '#9ca3af' : '#6b7280',
            margin: 0
          }}>
            Challenge yourself and compete with players worldwide
          </p>
        </motion.div>
      </main>
    </div>
  );
};
