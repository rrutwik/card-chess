import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PlayPage } from './pages/PlayPage';
import { GamesListPage } from './pages/GamesListPage';
import { HistoryPage } from './pages/HistoryPage';
import { GamePage } from './pages/GamePage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/play" element={<PlayPage />} />
            <Route path="/games" element={<GamesListPage />} />
            <Route path="/game/:gameId" element={<GamePage />} />
            <Route path="/history" element={<HistoryPage />} />
            {/* Add more routes as needed */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
