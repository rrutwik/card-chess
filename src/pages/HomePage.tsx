import React from 'react';
import { motion } from 'motion/react';
import { Play, Users, Crown, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Simple Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Crown className="w-12 h-12 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
              Card Chess
            </h1>
            <Swords className="w-12 h-12 text-primary" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Play chess with cards. Strategy meets chance.
          </p>
        </motion.div>

        {/* Game Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group"
          >
            <Link
              to="/play"
              className="block bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/20 group-hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-3 text-center">New Game</h3>
              <p className="text-muted-foreground text-center">
                Start a fresh game with card-based chess mechanics
              </p>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group"
          >
            <Link
              to="/games"
              className="block bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/20 group-hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-3 text-center">Active Games</h3>
              <p className="text-muted-foreground text-center">
                Join ongoing games or continue your matches
              </p>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
