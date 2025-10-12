import { PlayingCard, Suit } from '../types/game';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export interface MoveHistory {
  card: PlayingCard;
  move: {
    from: string;
    to: string;
    piece: string;
  },
  player: "white" | "black"
}

export function createDeck(): PlayingCard[] {
  const cards: PlayingCard[] = [];

  for (const suit of SUITS) {
    for (const value of VALUES) {
      cards.push({
        suit,
        value,
        color: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'
      });
    }
  }
  const redJoker = {
    suit: 'joker' as Suit,
    value: 'Joker',
    color: 'red' as const
  }
  const blackJoker = {
    suit: 'joker' as Suit,
    value: 'Joker',
    color: 'black' as const
  }
  cards.push(redJoker);
  cards.push(blackJoker);

  return shuffleDeck(cards);
}

export function shuffleDeck(deck: PlayingCard[]): PlayingCard[] {
  const shuffled = [...deck];
  const randomBuffer = new Uint32Array(1);
  for (let i = shuffled.length - 1; i > 0; i--) {
    window.crypto.getRandomValues(randomBuffer);
    const j = randomBuffer[0] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
