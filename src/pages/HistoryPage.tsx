import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Clock, Eye, RotateCcw } from 'lucide-react';
import { ChessAPI, ChessGame } from '../services/api';
import { Header } from '../components/Header';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<ChessGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGameHistory();
  }, []);

  const loadGameHistory = async () => {
    try {
      setLoading(true);
      const response = await ChessAPI.getGameHistory(50); // Load last 50 games
      setGames(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading game history:', err);
      setError(err.response?.data?.message || 'Failed to load game history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getGameResult = (game: ChessGame) => {
    if (game.game_state.status === 'abandoned') {
      return 'Abandoned';
    }
    if (game.game_state.winner === 'draw') {
      return 'Draw';
    }
    return `${game.game_state.winner} wins`;
  };

  const getResultColor = (game: ChessGame) => {
    if (game.game_state.status === 'abandoned') {
      return 'text-muted-foreground';
    }
    if (game.game_state.winner === 'draw') {
      return 'text-yellow-600 dark:text-yellow-500';
    }
    return 'text-green-600 dark:text-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading game history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center bg-card p-8 rounded-xl shadow-lg max-w-md mx-auto border border-border">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={loadGameHistory}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header showBackButton={true} backTo="/" />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 py-8 w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Game History</h1>
                <p className="text-muted-foreground">Review your past games and track your progress</p>
              </div>
              <button
                onClick={() => navigate('/games')}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Active Games</span>
              </button>
            </div>
          </motion.div>

          {games.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center py-12"
            >
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Games Yet</h3>
              <p className="text-muted-foreground mb-6">Start playing to build your game history!</p>
              <button
                onClick={() => navigate('/play')}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Play Your First Game
              </button>
            </motion.div>
          ) : (
            <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Game
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Result
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Moves
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Played
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {games.map((game, index) => (
                      <motion.tr
                        key={game._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-muted/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-card-foreground">
                            Game {game.game_id.slice(0, 8)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {game.game_state.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getResultColor(game)}`}>
                            {getGameResult(game)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                          {game.game_state.moves?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {game.created_at && game.completed_at ? (
                            (() => {
                              const duration = new Date(game.completed_at).getTime() - new Date(game.created_at).getTime();
                              const minutes = Math.floor(duration / 60000);
                              return `${minutes}m`;
                            })()
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {game.completed_at ? formatDate(game.completed_at) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/game/${game.game_id}`)}
                            className="text-primary hover:text-primary/80 flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
