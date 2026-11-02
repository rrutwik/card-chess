/** FAQ shown on the home page and /how-to-play; also emitted as FAQPage JSON-LD. Keep in sync with the game code. */
export interface Faq {
  question: string;
  answer: string;
}

export const HOW_TO_PLAY_FAQS: Faq[] = [
  {
    question: 'What is Card Chess?',
    answer:
      'Card Chess is a chess variant where you draw playing cards and the card decides which piece you are allowed to move. The board, the pieces and the move rules are the same as in normal chess.',
  },
  {
    question: 'How do I win at Card Chess?',
    answer:
      'You win by checkmating your opponent\'s king, exactly as in standard chess. Stalemate and other standard draws end the game as a draw.',
  },
  {
    question: 'What happens if none of my cards has a legal move?',
    answer:
      'You draw again. The draw button is only available when you hold no cards or none of the cards you hold has a legal move. If you are in check and draw five times without getting a card that can answer the check, you lose the game.',
  },
  {
    question: 'What does the Joker do?',
    answer: 'A Joker lets you move any one of your pieces, as long as the move is legal in chess.',
  },
  {
    question: 'Is Card Chess free?',
    answer: 'Yes. Card Chess is free to play in your browser, with no download. You can play against a bot or against another player.',
  },
];
