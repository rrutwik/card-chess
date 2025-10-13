# Card Chess Game

A unique chess variant where players draw cards from a standard 54-card deck to determine which pieces they can move. Built with React, TypeScript, and Tailwind CSS.

## 🎮 Game Rules

- **Cards 2-9**: Move a pawn
- **Card A**: Move a rook
- **Card 10**: Move a knight
- **Jack**: Move a bishop
- **Queen**: Move the queen
- **King**: Move the king (can move into check)
- **Joker**: Move ANY piece

### Special Rules
- White always draws first
- Kings can move into or be in check
- Game ends when a king is captured
- Deck reshuffles when empty

## 📁 Project Structure

```
├── App.tsx                    # Main application component
├── components/
│   ├── ChessBoardV2.tsx      # Chess board with piece rendering
│   ├── CompactGameControls.tsx # Game controls sidebar
│   ├── CollapsibleRulesSidebar.tsx # Collapsible rules panel
│   ├── MoveHistoryFooter.tsx # Move history footer
│   └── ui/                   # shadcn/ui components
├── hooks/
│   └── useCardChess.ts       # Main game logic hook
├── utils/
│   ├── boardUtils.ts         # Board initialization & helpers
│   ├── deckUtils.ts          # Card deck creation & shuffling
│   └── moveValidation.ts     # Chess move validation logic
├── types/
│   └── game.ts               # TypeScript type definitions
├── constants/
│   └── chess.ts              # Game constants & symbols
└── styles/
    └── globals.css           # Global styles & Tailwind config
```

## 🏗️ Architecture

### Components
- **ChessBoardV2**: Renders the 8x8 chess board with pieces, handles square clicks, shows valid moves
- **CompactGameControls**: Displays current card, deck status, action buttons
- **CollapsibleRulesSidebar**: Slide-in sidebar with game rules
- **MoveHistoryFooter**: Expandable footer showing move history

### Custom Hook
- **useCardChess**: Manages all game state and logic
  - Board state
  - Card deck management
  - Move validation
  - Turn management
  - Game over detection

### Utilities
- **boardUtils**: Board initialization, position validation, notation conversion
- **deckUtils**: Deck creation and shuffling algorithms
- **moveValidation**: Validates moves based on piece type and card drawn

### Types
- Centralized TypeScript interfaces for type safety
- `Piece`, `Position`, `PlayingCard`, `GameState`

### Constants
- Chess piece symbols (Unicode)
- Card suit symbols
- Card-to-piece mappings
- Movement direction vectors

## 🎨 Design Features

- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional design with smooth animations
- **Glass-morphism**: Subtle depth and transparency effects
- **Color-coded**: Clear visual feedback for turns and valid moves
- **Sticky Elements**: Header and controls stay accessible
- **Collapsible Panels**: Rules and history don't clutter the board

## 🚀 Key Features

1. **Clean Separation of Concerns**: Logic separated from UI
2. **Type Safety**: Full TypeScript coverage
3. **Reusable Utilities**: Modular, testable functions
4. **Custom Hook Pattern**: Encapsulated game logic
5. **Production Ready**: Optimized, documented, maintainable

## 🔧 Development

The codebase follows React best practices:
- Custom hooks for stateful logic
- Utility functions for pure logic
- Constants for magic values
- TypeScript for type safety
- Consistent naming conventions
- Component composition

## 📝 Notes

- The game uses standard chess movement rules
- Capturing the king ends the game (not checkmate)
- Deck automatically reshuffles when empty
