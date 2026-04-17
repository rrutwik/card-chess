import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Users, Crown, Swords, Trophy, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import { logger } from '../utils/logger';
import { CollapsibleRulesSidebar } from '../components/CollapsibleRulesSidebar';
import { useAppStore } from '../stores/appStore';

export const HomePage: React.FC = () => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const { showRules, setShowRules } = useAppStore();

  useEffect(() => {
    logger.info('HomePage: Mounted');
  }, []);

  const cards = [
    {
      to: '/play',
      id: 'new-game-home-btn',
      icon: <Play style={{ width: 26, height: 26, color: 'white' }} />,
      iconBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      iconShadow: '0 8px 20px rgba(102, 126, 234, 0.45)',
      cardBg: isDark
        ? 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15))'
        : 'white',
      borderColor: isDark ? 'rgba(102,126,234,0.25)' : 'rgba(102,126,234,0.2)',
      shadow: isDark ? '0 4px 24px rgba(0,0,0,0.35)' : '0 4px 20px rgba(102,126,234,0.12)',
      title: 'New Game',
      desc: 'Start a fresh game with card-based chess mechanics',
      badge: null,
    },
    {
      to: '/games',
      id: 'active-games-home-btn',
      icon: <Users style={{ width: 26, height: 26, color: 'white' }} />,
      iconBg: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      iconShadow: '0 8px 20px rgba(168,85,247,0.45)',
      cardBg: isDark
        ? 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.15))'
        : 'white',
      borderColor: isDark ? 'rgba(168,85,247,0.25)' : 'rgba(168,85,247,0.2)',
      shadow: isDark ? '0 4px 24px rgba(0,0,0,0.35)' : '0 4px 20px rgba(168,85,247,0.12)',
      title: 'Active Games',
      desc: 'Join ongoing games or continue your matches',
      badge: null,
    },
    {
      to: '/find-opponent',
      id: 'find-opponent-home-btn',
      icon: <Search style={{ width: 26, height: 26, color: 'white' }} />,
      iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      iconShadow: '0 8px 20px rgba(16,185,129,0.45)',
      cardBg: isDark
        ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.15))'
        : 'white',
      borderColor: isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.2)',
      shadow: isDark ? '0 4px 24px rgba(0,0,0,0.35)' : '0 4px 20px rgba(16,185,129,0.12)',
      title: 'Find Opponent',
      desc: 'Quick matchmaking — guests welcome, 3 cards per turn',
      badge: 'LIVE',
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: isDark
        ? 'linear-gradient(180deg, #0f0f1e 0%, #1a1a2e 50%, #0f0f1e 100%)'
        : 'linear-gradient(180deg, #f4f6ff 0%, #ffffff 50%, #f4f6ff 100%)',
      color: isDark ? '#f9fafb' : '#1f2937',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      <style>{`
        .home-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }
        @media (min-width: 640px) {
          .home-cards-grid {
            grid-template-columns: repeat(3, 1fr);
            max-width: 800px;
            gap: 18px;
          }
        }
        .home-card-link {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          text-decoration: none;
          border-radius: 18px;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .home-card-link {
            flex-direction: column;
            align-items: center;
            padding: 24px 18px;
            gap: 0;
          }
        }
        .home-card-link:active {
          transform: scale(0.97);
        }
        .home-card-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        @media (min-width: 640px) {
          .home-card-icon {
            width: 56px;
            height: 56px;
            margin-bottom: 14px;
          }
        }
        .home-card-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 2px 0;
        }
        @media (min-width: 640px) {
          .home-card-title {
            font-size: 20px;
            text-align: center;
            margin-bottom: 6px;
          }
        }
        .home-card-desc {
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          opacity: 0.7;
        }
        @media (min-width: 640px) {
          .home-card-desc {
            text-align: center;
            font-size: 12.5px;
          }
        }
        .home-bottom-cta {
          padding: 18px;
          border-radius: 16px;
          text-align: center;
          margin-top: 20px;
          max-width: 480px;
          width: 100%;
          margin-left: auto;
          margin-right: auto;
        }
        @media (min-width: 640px) {
          .home-bottom-cta {
            max-width: 800px;
          }
        }
      `}</style>

      <CollapsibleRulesSidebar isOpen={showRules} onClose={() => setShowRules(false)} />
      <Header />

      {/* Background glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '5%', right: '5%',
          width: '300px', height: '300px', borderRadius: '50%', filter: 'blur(60px)',
          background: isDark
            ? 'radial-gradient(circle, rgba(102,126,234,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '5%',
          width: '250px', height: '250px', borderRadius: '50%', filter: 'blur(60px)',
          background: isDark
            ? 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
        }} />
      </div>

      <main style={{
        position: 'relative', zIndex: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px 32px',
        justifyContent: 'center',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%',
      }}>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          style={{ textAlign: 'center', marginBottom: '28px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <motion.div
              animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
            >
              <Crown style={{ width: 32, height: 32, color: '#667eea', filter: 'drop-shadow(0 4px 8px rgba(102,126,234,0.4))' }} />
            </motion.div>
            <h1 style={{ fontSize: 'clamp(26px, 7vw, 42px)', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: isDark ? '#f9fafb' : '#1f2937' }}>
              Card Chess
            </h1>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut', delay: 0.5 }}
            >
              <Swords style={{ width: 32, height: 32, color: '#a855f7', filter: 'drop-shadow(0 4px 8px rgba(168,85,247,0.4))' }} />
            </motion.div>
          </div>

          <p style={{ fontSize: '14px', color: isDark ? '#d1d5db' : '#6b7280', maxWidth: 520, margin: '0 auto 12px', lineHeight: 1.5, padding: '0 8px' }}>
            Play chess with cards. Strategy meets chance in this exciting twist on the classic game.
          </p>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[{ icon: '⚡', text: 'Fast-paced' }, { icon: '🎯', text: 'Strategic' }, { icon: '🎲', text: 'Unpredictable' }].map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.5 + i * 0.1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '5px 12px', borderRadius: 20,
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(102,126,234,0.08)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(102,126,234,0.2)'}`,
                  fontSize: 12, fontWeight: 500,
                  color: isDark ? '#e5e7eb' : '#4b5563',
                }}
              >
                <span style={{ fontSize: 13 }}>{badge.icon}</span>
                <span>{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="home-cards-grid"
        >
          {cards.map((card, i) => (
            <Link
              key={card.id}
              to={card.to}
              id={card.id}
              className="home-card-link"
              style={{
                background: card.cardBg,
                border: `1px solid ${card.borderColor}`,
                boxShadow: card.shadow,
                backdropFilter: 'blur(10px)',
                color: 'inherit',
              }}
            >
              {/* Live Badge */}
              {card.badge && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 20,
                  background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                  fontSize: 9, fontWeight: 700, color: '#10b981',
                }}>
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }}
                  />
                  LIVE
                </div>
              )}

              <div
                className="home-card-icon"
                style={{ background: card.iconBg, boxShadow: card.iconShadow }}
              >
                {card.icon}
              </div>

              <div>
                <h3 className="home-card-title" style={{ color: isDark ? '#f9fafb' : '#1f2937' }}>
                  {card.title}
                </h3>
                <p className="home-card-desc" style={{ color: isDark ? '#d1d5db' : '#6b7280' }}>
                  {card.desc}
                </p>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="home-bottom-cta"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(102,126,234,0.05)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(102,126,234,0.15)'}`,
          }}
        >
          <Trophy style={{ width: 26, height: 26, color: '#fbbf24', margin: '0 auto 8px', display: 'block', filter: 'drop-shadow(0 4px 8px rgba(251,191,36,0.4))' }} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: isDark ? '#f9fafb' : '#1f2937', margin: '0 0 4px' }}>
            Ready to Master the Board?
          </h3>
          <p style={{ fontSize: 13, color: isDark ? '#9ca3af' : '#6b7280', margin: 0 }}>
            Challenge yourself and compete with players worldwide
          </p>
        </motion.div>
      </main>
    </div>
  );
};
