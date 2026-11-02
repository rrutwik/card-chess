import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { HomePage } from './pages/HomePage';
import { HowToPlayPage } from './pages/HowToPlayPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useSeo } from './seo/useSeo';

// Game/app screens are code-split so the landing page doesn't download them (or the chess engine).
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const PlayPage = lazy(() => import('./pages/PlayPage').then((m) => ({ default: m.PlayPage })));
const GamesListPage = lazy(() => import('./pages/GamesListPage').then((m) => ({ default: m.GamesListPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const GamePage = lazy(() => import('./pages/GamePage').then((m) => ({ default: m.GamePage })));
const FindOpponentPage = lazy(() =>
  import('./pages/FindOpponentPage').then((m) => ({ default: m.FindOpponentPage }))
);

/** Keeps <title>, description, canonical, robots and Open Graph tags in sync with the route. */
function SeoManager() {
  useSeo();
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <SeoManager />
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/how-to-play" element={<HowToPlayPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/play" element={<PlayPage />} />
              <Route path="/games" element={<ProtectedRoute><GamesListPage /></ProtectedRoute>} />
              <Route path="/game/:gameId" element={<GamePage />} />
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/find-opponent" element={<FindOpponentPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
