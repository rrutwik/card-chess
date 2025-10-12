import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Clock, Users, Play, Plus } from "lucide-react";
import { ChessAPI, ChessGame } from "../services/api";
import { Header } from "../components/Header";

export const GamesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<ChessGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const response = await ChessAPI.getActiveGames();
      setGames(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error("Error loading games:", err);
      setError(err.response?.data?.message || "Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getGameStatus = (game: ChessGame) => {
    const status = game.game_state.status;
    const turn = game.game_state.turn;

    if (status === "completed") {
      return `Finished - ${
        game.game_state.winner === "draw"
          ? "Draw"
          : `${game.game_state.winner} wins`
      }`;
    }
    if (status === "abandoned") {
      return "Abandoned";
    }
    return `Active - ${turn}'s turn`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">Loading games...</p>
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
              <Clock className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-3xl font-bold text-destructive mb-4">Error</h2>
            <p className="text-muted-foreground mb-8 text-lg">{error}</p>
            <button
              onClick={loadGames}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <Clock className="w-5 h-5" />
              <span>Try Again</span>
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
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-3">
                Active Games
              </h1>
              <p className="text-muted-foreground text-lg">
                Join existing games or start a new one
              </p>
            </div>
            <button
              onClick={() => navigate("/play")}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Game</span>
            </button>
          </div>

          {games.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center py-20"
            >
              <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mx-auto mb-8">
                <Users className="w-20 h-20 text-muted-foreground" />
              </div>
              <h3 className="text-3xl font-semibold text-foreground mb-4">
                No Active Games
              </h3>
              <p className="text-muted-foreground mb-10 text-xl">
                Be the first to start a game!
              </p>
              <button
                onClick={() => navigate("/play")}
                className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl hover:bg-primary/90 transition-all text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                Start New Game
              </button>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {games.map((game, index) => (
                <motion.div
                  key={game._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group bg-card rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-border"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-card-foreground text-xl mb-1">
                          Game {game.game_id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDate(game.created_at || "")}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          game.game_state.status === "active"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {game.game_state.status}
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Players:</span>
                        <span className="font-semibold text-card-foreground">2</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-semibold text-card-foreground">
                          {getGameStatus(game)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Moves:</span>
                        <span className="font-semibold text-card-foreground">
                          {game.game_state.moves?.length || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate(`/game/${game.game_id}`)}
                        className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                      >
                        <Play className="w-4 h-4" />
                        <span>Join</span>
                      </button>
                      <button
                        onClick={() => {
                          const gameUrl = `${window.location.origin}/game/${game.game_id}`;
                          navigator.clipboard.writeText(gameUrl);
                          alert("Game link copied to clipboard!");
                        }}
                        className="p-3 border-2 border-border rounded-2xl hover:bg-accent transition-all hover:border-border"
                        title="Copy game link"
                      >
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
