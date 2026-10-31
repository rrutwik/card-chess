# Product Note: Card Chess Web

**Product Name:** Card Chess (Web Edition)  
**Document Version:** 1.0.0  
**Target Platform:** Modern Web (Desktop, Tablet, Mobile)  
**Primary Tech Stack:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Socket.IO, Chess.js, Zustand  
**Repository Path:** `card_chess_web/`  

---

## 1. Executive Summary & Vision

**Card Chess** is a strategic turn-based web game that bridges traditional chess strategy with the stochastic unpredictability of card gaming. Players draw from a standard 54-card deck (52 standard cards + 2 jokers) to dictate which pieces or files they are permitted to move on their turn.

By injecting controlled card randomness into the classical 8x8 deterministic chess matrix, Card Chess:
1. **Levels the playing field** between grandmasters and casual players by preventing rigid opening book memorization.
2. **Accelerates tactical decision-making** under dynamic constraints.
3. **Offers frictionless instant play** via guest sessions and live WebSocket matchmaking without mandatory account setup.

---

## 2. Core Game Rules & Mechanics

### 2.1 The Deck & Piece Mapping
The game utilizes a full 54-card deck (52 cards across 4 suits plus 1 Red Joker and 1 Black Joker). Every card corresponds to a specific chess piece or pawn file:

| Card Value | Permitted Move | Strategic Role |
| :--- | :--- | :--- |
| **2** | Move Pawn on **a-file** | Flank pressure & pawn structure |
| **3** | Move Pawn on **b-file** | Flank attack / pawn advance |
| **4** | Move Pawn on **c-file** | Queen-side center control |
| **5** | Move Pawn on **d-file** | Central pawn push / opening lines |
| **6** | Move Pawn on **e-file** | King-side center control / opening lines |
| **7** | Move Pawn on **f-file** | King-side expansion |
| **8** | Move Pawn on **g-file** | Flank attack / fianchetto defense |
| **9** | Move Pawn on **h-file** | Flank rook lift / wing control |
| **10** | Move any **Knight** | Tactical jumps over barriers |
| **A (Ace)** | Move any **Rook** | Open file domination & heavy battery |
| **J (Jack)** | Move any **Bishop** | Diagonal snipes & color complex control |
| **Q (Queen)** | Move the **Queen** | Maximum mobility & king attacks |
| **K (King)** | Move the **King** | King safety & endgame centralization |
| **JOKER** | **Move ANY piece!** | Universal Wildcard — decisive tactical tempo |

### 2.2 Special Match Rules
* **First Turn:** White always draws and plays first.
* **Hand Capacity & Multi-Draw:**
  * Configurable from **1 to 5 cards** per turn (standard matchmaking defaults to 3 cards).
  * Multiple cards provide branching tactical choices. Selecting a card dynamically filters the highlighted legal moves on the board.
* **No Legal Move Condition:** If a player draws cards that have no legal moves on the board (e.g., drawing a Queen card when the Queen is trapped or already captured), the system identifies `noValidCard` and allows a redraw or turn progression.
* **Deck Exhaustion:** When the draw pile is depleted, the discard pile automatically reshuffles using a cryptographically secure random permutation algorithm (`window.crypto.getRandomValues`).
* **Check & King Mechanics:**
  * Normal chess check, checkmate, stalemate, threefold repetition, and draw rules apply via `chess.js`.
  * In check situations, players have up to **5 attempts** (`MAX_CHECK_ATTEMPTS = 5`) to draw escape-capable cards.
* **Pawn Promotion:** Pawns reaching the 8th rank trigger an interactive modal allowing promotion to Queen, Rook, Bishop, or Knight.

---

## 3. Game Modes & User Journeys

```
                    ┌─────────────────────────┐
                    │       Home Page         │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   Play vs Bot    │   │ Live Matchmaking │   │ Private Friends  │
│ (Single-Player)  │   │ ("Find Opponent")│   │  (Shareable Link)│
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                ▼
                    ┌─────────────────────────┐
                    │    Active Match Page    │
                    │      (/game/:gameId)    │
                    └─────────────────────────┘
```

### 3.1 Single Player (vs AI Bot)
* **Target User:** Solo players looking for quick training or offline practice.
* **Bot Intelligence:** Powered by `src/utils/bot.ts`. Uses a heuristic material evaluation engine:
  * Evaluates piece captures ($Value \times 10$), checks ($+3$), checkmates ($+1000$), stalemates/draws ($-20$), and whole-board piece balance.
  * Adds micro-jitter ($0.5$ random score) to keep bot behavior organic and unpredictable.
* **Simulation Loop:** Automatically triggers a 2-second thinking delay before playing to simulate real-world opponents.

### 3.2 Live Quick Matchmaking ("Find Opponent")
* **Target User:** Players wanting instant global multiplayer.
* **Architecture:** WebSocket-based queuing via `ChessSocket` (`join_matchmaking`, `matchmaking_count`, `matchmaking_found`).
* **Flow:**
  1. Displays real-time count of active queue participants.
  2. Measures search duration in seconds with timeout fail-safes.
  3. Seamlessly pairs players, assigns colors (`white` / `black`), sets 3 cards per turn, and animates transition to `/game/:gameId`.

### 3.3 Private Human-vs-Human Matches
* **Target User:** Friends and community players.
* **Flow:** Host chooses side (White / Black / Random) and cards-to-draw count (1 to 5).
* **Viral Sharing:** Automatic Web Share API integration (native iOS/Android share sheet) with one-click clipboard fallback.

### 3.4 Active Games & Historical Archives
* **Active Games (`/games`):** Lists ongoing games with turn notifications and direct resume links.
* **Game History (`/history`):** Chronological log of past matches featuring victory/defeat labels, completed timestamps, and PGN playback records.

---

## 4. Technical Architecture

### 4.1 Frontend Directory Blueprint
```
card_chess_web/src/
├── components/           # UI Components
│   ├── ChessBoard.tsx            # Board wrapper with react-chessboard & square highlights
│   ├── CompactGameControls.tsx   # Hand deck, draw button, check indicator & settings
│   ├── PlayingCard.tsx           # Scalable card visual with selection glow & suits
│   ├── CollapsibleRulesSidebar.tsx # Slide-in drawer explaining piece mappings
│   ├── MoveHistoryFooter.tsx     # Expandable bottom drawer listing moves & cards
│   ├── GoogleLogin.tsx           # Google OAuth button & auth handlers
│   └── Header.tsx                # App navigation, theme toggler, user profile
├── contexts/             # Global Contexts
│   ├── AuthContext.tsx           # Hybrid Auth/Guest identity management
│   └── ThemeContext.tsx          # Dark / Light theme detection & toggle
├── hooks/                # Stateful Game Hooks
│   ├── useCardChess.ts           # Central chess + card rules engine & socket bridge
│   └── useChessSocket.ts         # Socket event subscription wrapper
├── pages/                # Route Page Views
│   ├── HomePage.tsx              # Landing & mode selection portal
│   ├── PlayPage.tsx              # Game creation & active room listing
│   ├── GamePage.tsx              # Full interactive match screen
│   ├── FindOpponentPage.tsx      # Real-time multiplayer matchmaking
│   ├── GamesListPage.tsx         # Active game management
│   ├── HistoryPage.tsx           # Finished match archives
│   ├── LoginPage.tsx             # OAuth sign-in screen
│   └── PrivacyPolicyPage.tsx     # Compliance & privacy disclosures
├── services/             # Networking & API Layer
│   ├── api.ts                    # Axios client, error interceptor, retry mechanism
│   └── socket.ts                 # Socket.IO client for live gameplay & matchmaking
├── stores/               # Zustand Global State
│   ├── appStore.ts               # Global toast alerts, loaders, online/offline status
│   └── gameStore.ts              # Current active game metadata & UI options
└── utils/                # Pure Logic & Engines
    ├── bot.ts                    # Heuristic move evaluation engine
    ├── deckUtils.ts              # 54-card generation & Fisher-Yates crypto shuffle
    ├── sessionIdentity.ts        # Transparent guest session creator & device fingerprinting
    └── sounds.ts                 # Zero-latency Web Audio API preloaded soundboard
```

### 4.2 State Management & Synchronization
* **Game Logic Isolation:** Centralized in `useCardChess.ts`. It acts as the single source of truth reconciling `chess.js` local validation with remote WebSocket events.
* **Monotonic Versioning:** Every game action increments a monotonic `version` counter. If a socket broadcast contains an older or identical version, it is discarded to prevent out-of-order race conditions.
* **Dual Persistence:**
  * Preferences (Dark/Light mode, sidebar widths, sound mute, auto-draw preferences) are stored in `localStorage`.
  * Ephemeral session tokens are maintained in `sessionStorage` for guests and `localStorage` for registered users.

### 4.3 Networking & Resilience
* **Axios Interceptor with Exponential Backoff:** Automatically retries transient network errors (HTTP 408, 429, 500, 502, 503, 504) up to 3 times before failing gracefully.
* **Token Refresh Lifecycle:** Automatic silent token renewal through `/auth/refresh_token` when tokens expire.
* **Real-time Socket Transport:** Pure WebSocket transport (`transports: ["websocket"]`) with automated reconnection (5 attempts, 1000ms delay).

### 4.4 Low-Latency Web Audio Engine (`sounds.ts`)
Zero network latency during play achieved by pre-fetching and decoding sound assets into `AudioBuffer` objects using the browser's native `AudioContext`:
* `move`: Piece placement sound.
* `capture`: Piece elimination audio.
* `check`: Danger warning alert.
* `checkmate`: Victory/defeat crescendo.
* `draw`: Stalemate / draw notification.
* `cardDraw`: Physical playing card shuffle/deal sound.

---

## 5. Authentication & Frictionless Onboarding

Card Chess adopts a **"Play First, Register Later"** design philosophy:

| Attribute | Guest Session | Google OAuth Account |
| :--- | :--- | :--- |
| **Setup Required** | None (Zero clicks) | 1-Click Google Sign-In |
| **Token Model** | `x-guest-token` generated via device fingerprint | Standard JWT `Bearer` token |
| **Matchmaking Access** | Full access to Live Matchmaking & Bot games | Full access to all game modes |
| **History & Profiles** | Scoped to current browser session | Synced permanently across devices |
| **Persistence** | `sessionStorage` | `localStorage` with refresh token |

---

## 6. UI/UX & Design Language

* **Theme System:** Native dark and light mode support with fluid transitions.
  * Dark mode uses deep midnight navy gradients (`#0f0f1e` to `#1a1a2e`).
  * Light mode utilizes clean whites and gentle indigo gradients (`#f4f6ff`).
* **Micro-interactions:** Framer Motion (`motion/react`) animations for card drawing, card flipping, pulsating selection rings, slide-in sidebars, and checkmate alerts.
* **Adaptive Board & Resizable Panels:**
  * Responsive chessboard dynamically computes exact container dimensions via `ResizeObserver`.
  * Desktop users have a draggable divider to customize sidebar width (`cc_sidebar_w`).
  * Mobile users get a bottom sheet drawer with height-adjustable touch controls (`cc_bottom_h`).
* **Game Settings Modal:** Allows toggling sound effects, auto-draw (automatic card draw when hand is empty), and move highlighting.

---

## 7. Product Strengths & Strategic Roadmap

### 7.1 Key Strengths
1. **Instant Engagement:** Zero login barrier means users can start playing within 3 seconds of opening the site.
2. **High Strategic Depth:** Novel tactical considerations (e.g., holding Jokers for check escapes or surprise king strikes).
3. **Resilient Architecture:** Real-time socket sync with versioning, retryable HTTP layer, and offline detection.
4. **Haptic & Audio Polish:** Physical card animations and native Web Audio integration.

### 7.2 Future Product Opportunities & Roadmap
* **Timed Chess Clocks:** Addition of Blitz (3+2), Rapid (10+0), and Bullet clocks for competitive play.
* **Ranked MMR & Leaderboards:** Competitive tier progression (Bronze to Grandmaster) based on Elo ratings.
* **Stockfish / Multi-Tier AI:** Expanding the bot engine with configurable difficulty levels (Beginner, Intermediate, Advanced).
* **Spectator Mode:** Room spectator capabilities with live card reveal toggles.
* **Deck Customization / Collectibles:** Unlockable card backs, board themes, and piece skins.
