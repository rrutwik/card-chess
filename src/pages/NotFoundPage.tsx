import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { SiteFooter } from '../components/SiteFooter';
import { useTheme } from '../contexts/ThemeContext';

/** Shown for unknown URLs. useSeo() marks it noindex (soft-404 handling for a client-routed SPA). */
export const NotFoundPage: React.FC = () => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: isDark ? '#0f0f1e' : '#f8f9ff',
        color: isDark ? '#f9fafb' : '#1f2937',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <Header />
      <main style={{ flex: 1, textAlign: 'center', padding: '64px 20px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 800, margin: '0 0 12px' }}>Page not found</h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 20px', color: isDark ? '#d1d5db' : '#4b5563' }}>
          We couldn&apos;t find the page you were looking for.
        </p>
        <p style={{ fontSize: 16, margin: 0 }}>
          <Link to="/" style={{ color: isDark ? '#c7d2fe' : '#4f46e5', fontWeight: 600 }}>Back to Card Chess</Link>
          {' · '}
          <Link to="/how-to-play" style={{ color: isDark ? '#c7d2fe' : '#4f46e5', fontWeight: 600 }}>How to play</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
};
