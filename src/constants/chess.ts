export const BOARD_SIZE = 8;

export const PIECE_SYMBOLS = {
  king: { white: '♔', black: '♚' },
  queen: { white: '♕', black: '♛' },
  rook: { white: '♖', black: '♜' },
  bishop: { white: '♗', black: '♝' },
  knight: { white: '♘', black: '♞' },
  pawn: { white: '♙', black: '♟' }
} as const;

export const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
  joker: '🃏'
} as const;

export const CARD_MEANINGS: Record<string, string> = {
  'A': 'Move Rook',
  '2': 'Move Pawn at a',
  '3': 'Move Pawn at b',
  '4': 'Move Pawn at c',
  '5': 'Move Pawn at d',
  '6': 'Move Pawn at e',
  '7': 'Move Pawn at f',
  '8': 'Move Pawn at g',
  '9': 'Move Pawn at h',
  '10': 'Move Knight',
  'J': 'Move Bishop',
  'Q': 'Move Queen',
  'K': 'Move King',
  'JOKER': 'Move Any Piece!'
};

export const CardChessMap = {
  a: "2",
  b: "3",
  c: "4",
  d: "5",
  e: "6",
  f: "7",
  g: "8",
  h: "9"
};

export const PieceCardMap: Record<string, string> = {
  rook: 'A',
  knight: '10',
  bishop: 'J',
  queen: 'Q',
  king: 'K',
  any: 'JOKER',
  ...Object.fromEntries(Object.entries({
    a: '2', b: '3', c: '4', d: '5', e: '6', f: '7', g: '8', h: '9'
  }).map(([file, card]) => [`pawn_${file}`, card]))
};