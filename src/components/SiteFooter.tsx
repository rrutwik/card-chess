import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const LINKS = [
  { to: '/how-to-play', label: 'How to play Card Chess' },
  { to: '/play', label: 'Play vs bot' },
  { to: '/find-opponent', label: 'Find an opponent' },
  { to: '/privacy-policy', label: 'Privacy policy' },
];

/** Crawlable site-wide links. Plain <a href> via react-router Link, descriptive anchor text. */
export const SiteFooter: React.FC = () => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const color = isDark ? '#9ca3af' : '#6b7280';

  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '20px 16px 28px',
        textAlign: 'center',
        fontSize: 13,
        color,
      }}
    >
      <nav aria-label="Footer">
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px 18px',
          }}
        >
          {LINKS.map((link) => (
            <li key={link.to}>
              <Link to={link.to} style={{ color: isDark ? '#c7d2fe' : '#4f46e5', textDecoration: 'none' }}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p style={{ margin: '12px 0 0' }}>Card Chess — chess meets cards. Free to play online.</p>
    </footer>
  );
};
