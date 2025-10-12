import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { GamesListPage } from './pages/GamesListPage';
import { HistoryPage } from './pages/HistoryPage';
import { NotificationProvider } from './components/NotificationProvider';
import { NetworkStatusIndicator } from './components/NetworkStatusIndicator';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  // AuthContext now handles initialization automatically
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomePage />} />
            <Route
              path="/play"
              element={
                <ProtectedRoute>
                  <GamePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <GamesListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/:gameId"
              element={
                <ProtectedRoute>
                  <GamePage />
                </ProtectedRoute>
              }
            />
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <NetworkStatusIndicator />
        </div>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
