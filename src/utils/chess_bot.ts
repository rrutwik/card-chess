import Stockfish from 'stockfish';

const stockfish = new Stockfish();

export const getBestMove = (fen: string) => {
  stockfish.postMessage(`position fen ${fen}`);
  stockfish.postMessage('go depth 10');
  return stockfish.getBestMove();
}