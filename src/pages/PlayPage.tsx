import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Users, Plus, Crown, Swords, Clock, Search, GamepadIcon, Share2 } from "lucide-react";
import { ChessAPI, ChessGame } from "../services/api";
import { Header } from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import type { User } from "../contexts/AuthContext";

export const PlayPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [games, setGames] = useState<ChessGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<'white' | 'black'>('white');
  const [creatingGame, setCreatingGame] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ChessAPI.getActiveGames();
      setGames(response.data.data);
    } catch (err: any) {
      console.error("Error loading games:", err);
      setError(err.response?.data?.message || "Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    try {
      setCreatingGame(true);

      // Create game with current user and selected color
      const response = await ChessAPI.createGame(selectedColor);

      if (response.data?.data?.game_id) {
        const gameUrl = `${window.location.origin}/game/${response.data.data.game_id}`;
        navigate(`/game/${response.data.data.game_id}`);

        // Show shareable link
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Card Chess Game",
              text: "Join my Card Chess game!",
              url: gameUrl,
            });
          } catch (err) {
            // User cancelled sharing, just copy to clipboard
            copyToClipboard(gameUrl);
          }
        } else {
          copyToClipboard(gameUrl);
        }
      }
    } catch (err: any) {
      console.error("Error creating game:", err);
      setError(err.response?.data?.message || "Failed to create game");
    } finally {
      setCreatingGame(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
      console.log("Game link copied to clipboard!");
    });
  };

  const handleJoinGame = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };

  const waitingGames = games.filter(game => game.game_state.status === 'active' && !game.player_black);
  const activeGames = games.filter(game => game.game_state.status === 'active' && game.player_black);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">Loading...</p>
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
          <div className="text-center bg-card p-10 rounded-3xl shadow-lg max-w-md mx-auto border border-border">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-3xl font-bold text-destructive mb-4">Error</h2>
            <p className="text-muted-foreground mb-8 text-lg">{error}</p>
            <button
              onClick={loadGames}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <Crown className="w-12 h-12 text-primary" />
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                Create a game and share the link with a friend to start playing
              </h1>
              <Swords className="w-12 h-12 text-primary" />
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create a game and share the link with a friend to start playing
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Game Creation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-card rounded-3xl shadow-lg border border-border p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Plus className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold text-card-foreground">Create New Game</h2>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-card-foreground mb-3">
                  Choose Your Color
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedColor('white')}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                      selectedColor === 'white'
                        ? 'border-primary bg-primary/10 text-primary shadow-lg scale-105'
                        : 'border-border hover:border-primary/70 hover:bg-primary/5 hover:scale-102'
                    }`}
                  >
                    <div className="w-8 h-8 bg-white rounded-full mx-auto mb-2 border-2 border-gray-300 shadow-sm"></div>
                    <span className="text-sm font-medium">White</span>
                    <p className="text-xs text-muted-foreground mt-1">Moves first</p>
                  </button>
                  <button
                    onClick={() => setSelectedColor('black')}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                      selectedColor === 'black'
                        ? 'border-primary bg-primary/10 text-primary shadow-lg scale-105'
                        : 'border-border hover:border-primary/70 hover:bg-primary/5 hover:scale-102'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gray-800 rounded-full mx-auto mb-2 shadow-sm"></div>
                    <span className="text-sm font-medium">Black</span>
                    <p className="text-xs text-muted-foreground mt-1">Moves second</p>
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreateGame}
                disabled={creatingGame}
                className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                {creatingGame ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent" />
                    <span>Creating Game...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Create Game & Share Link</span>
                  </>
                )}
              </button>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Share2 className="w-4 h-4" />
                  <span>Share the game link with a friend to start playing!</span>
                </div>
              </div>
            </motion.div>

            {/* Join Existing Games */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card rounded-3xl shadow-lg border border-border p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold text-card-foreground">Join Game</h2>
              </div>

              <div className="space-y-4">
                {waitingGames.length === 0 && activeGames.length === 0 ? (
                  <div className="text-center py-8">
                    <GamepadIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No games available to join</p>
                    <p className="text-sm text-muted-foreground mt-2">Create a game above and share the link!</p>
                  </div>
                ) : (
                  <>
                    {waitingGames.length > 0 && (
                      <>
                        <h3 className="font-semibold text-card-foreground mb-3">Waiting for Players</h3>
                        {waitingGames.slice(0, 3).map((game) => (
                          <div
                            key={game._id}
                            className="p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer"
                            onClick={() => handleJoinGame(game.game_id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-card-foreground">
                                Game {game.game_id.slice(0, 8)}
                              </h4>
                              <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                Waiting
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Created by {game.player_white}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Created {new Date(game.created_at || "").toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {activeGames.length > 0 && (
                      <>
                        <h3 className="font-semibold text-card-foreground mb-3">Active Games</h3>
                        {activeGames.slice(0, 5).map((game) => (
                          <div
                            key={game._id}
                            className="p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer"
                            onClick={() => handleJoinGame(game.game_id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-card-foreground">
                                Game {game.game_id.slice(0, 8)}
                              </h4>
                              <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                Active
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {game.player_white} vs {game.player_black}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Current turn: {game.game_state.turn}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>

              {games.length > 5 && (
                <button
                  onClick={() => navigate("/games")}
                  className="w-full mt-4 bg-secondary text-secondary-foreground px-8 py-3 rounded-2xl hover:bg-secondary/90 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>View All Games</span>
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};
