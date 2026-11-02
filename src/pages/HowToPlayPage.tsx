import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { SiteFooter } from '../components/SiteFooter';
import { CollapsibleRulesSidebar } from '../components/CollapsibleRulesSidebar';
import { useTheme } from '../contexts/ThemeContext';
import { useAppStore } from '../stores/appStore';
import { HOW_TO_PLAY_FAQS } from '../seo/faqs';

const CARD_TABLE: { card: string; piece: string; note: string }[] = [
  { card: '2', piece: 'Pawn on the a-file', note: 'The pawn standing on the a-file moves.' },
  { card: '3', piece: 'Pawn on the b-file', note: 'The pawn standing on the b-file moves.' },
  { card: '4', piece: 'Pawn on the c-file', note: 'The pawn standing on the c-file moves.' },
  { card: '5', piece: 'Pawn on the d-file', note: 'The pawn standing on the d-file moves.' },
  { card: '6', piece: 'Pawn on the e-file', note: 'The pawn standing on the e-file moves.' },
  { card: '7', piece: 'Pawn on the f-file', note: 'The pawn standing on the f-file moves.' },
  { card: '8', piece: 'Pawn on the g-file', note: 'The pawn standing on the g-file moves.' },
  { card: '9', piece: 'Pawn on the h-file', note: 'The pawn standing on the h-file moves.' },
  { card: 'A', piece: 'Rook', note: 'Either of your rooks.' },
  { card: '10', piece: 'Knight', note: 'Either of your knights.' },
  { card: 'J', piece: 'Bishop', note: 'Either of your bishops.' },
  { card: 'Q', piece: 'Queen', note: 'Your queen.' },
  { card: 'K', piece: 'King', note: 'Your king.' },
  { card: 'Joker', piece: 'Any piece', note: 'Move any one of your pieces.' },
];

export const HowToPlayPage: React.FC = () => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const { showRules, setShowRules } = useAppStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const text = isDark ? '#e5e7eb' : '#374151';
  const heading = isDark ? '#f9fafb' : '#111827';
  const muted = isDark ? '#9ca3af' : '#6b7280';
  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(102,126,234,0.25)';
  const link = isDark ? '#c7d2fe' : '#4f46e5';

  const h2: React.CSSProperties = { fontSize: 22, fontWeight: 700, margin: '36px 0 10px', color: heading };
  const p: React.CSSProperties = { fontSize: 16, lineHeight: 1.7, margin: '0 0 12px', color: text };
  const li: React.CSSProperties = { marginBottom: 8 };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: isDark
          ? 'linear-gradient(180deg, #0f0f1e 0%, #1a1a2e 50%, #0f0f1e 100%)'
          : 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 50%, #f8f9ff 100%)',
        color: text,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <CollapsibleRulesSidebar isOpen={showRules} onClose={() => setShowRules(false)} />
      <Header />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px', flex: 1, width: '100%', boxSizing: 'border-box' }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: muted, marginBottom: 16 }}>
          <Link to="/" style={{ color: link, textDecoration: 'none' }}>Card Chess</Link> / How to Play
        </nav>

        <h1 style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 800, margin: '0 0 12px', color: heading }}>
          How to Play Card Chess
        </h1>
        <p style={p}>
          Card Chess is chess with a twist: instead of choosing any piece you like, you draw playing cards and the
          card decides which piece you may move. The board, the pieces and how each piece moves are the same as in
          normal chess, so if you know chess you already know most of the game. The only new question each turn is
          “which of my pieces can I move?”
        </p>
        <p style={p}>
          Ready to try it? <Link to="/play" style={{ color: link }}>Play Card Chess against the bot</Link> or{' '}
          <Link to="/find-opponent" style={{ color: link }}>find an opponent online</Link>.
        </p>

        <h2 style={h2}>The goal</h2>
        <p style={p}>
          Checkmate your opponent&apos;s king, just like in standard chess. Stalemate and the other standard draw
          conditions end the game as a draw. White always draws and moves first.
        </p>

        <h2 style={h2}>Which card moves which piece?</h2>
        <p style={p}>
          The game uses a standard 52-card deck plus two Jokers. Each card allows exactly one kind of piece to move:
        </p>
        <div style={{ overflowX: 'auto', border: `1px solid ${border}`, borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
              Card Chess: which piece each card lets you move
            </caption>
            <thead>
              <tr style={{ textAlign: 'left', color: heading }}>
                <th scope="col" style={{ padding: '10px 14px' }}>Card</th>
                <th scope="col" style={{ padding: '10px 14px' }}>Piece you may move</th>
                <th scope="col" style={{ padding: '10px 14px' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {CARD_TABLE.map((row) => (
                <tr key={row.card} style={{ borderTop: `1px solid ${border}` }}>
                  <th scope="row" style={{ padding: '10px 14px', color: heading, whiteSpace: 'nowrap' }}>{row.card}</th>
                  <td style={{ padding: '10px 14px', color: text }}>{row.piece}</td>
                  <td style={{ padding: '10px 14px', color: muted }}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...p, marginTop: 12 }}>
          Suits don&apos;t matter, only the value of the card. The number cards 2 to 9 stand for the eight pawns: 2 is
          the pawn on the a-file, 3 the b-file, and so on up to 9 for the h-file. The card refers to the file the
          pawn is on right now, so after a pawn captures sideways, the card you need for it changes.
        </p>

        <h2 style={h2}>How a turn works</h2>
        <ol style={{ ...p, paddingLeft: 22 }}>
          <li style={li}><strong>Draw.</strong> Press “Draw Card” to receive your card or cards for the turn. Depending on the game mode you draw between 1 and 5 cards (quick matchmaking uses 3).</li>
          <li style={li}><strong>Pick a piece.</strong> Choose a piece that one of your cards allows. Its legal moves are highlighted.</li>
          <li style={li}><strong>Move.</strong> Click a highlighted square. The move must be legal in chess, so you can&apos;t leave your own king in check.</li>
          <li style={li}><strong>Pass the turn.</strong> Your opponent draws and the game continues.</li>
        </ol>

        <h2 style={h2}>Special situations</h2>
        <ul style={{ ...p, paddingLeft: 22 }}>
          <li style={li}><strong>No playable card.</strong> If none of the cards you hold has a legal move, you draw again. You can only draw when you hold no cards or none of them can move.</li>
          <li style={li}><strong>Being in check.</strong> You must answer the check with a legal move. If you are in check and draw five times without getting a card that can answer it, you lose the game.</li>
          <li style={li}><strong>The Joker.</strong> A Joker is a wild card: move any one of your pieces, as long as the move is legal.</li>
          <li style={li}><strong>Normal chess moves still apply.</strong> Castling, en passant and pawn promotion are handled by the standard chess rules whenever the card you play allows that piece to move.</li>
          <li style={li}><strong>Running out of cards.</strong> The deck is reshuffled when it runs low, so it never runs dry.</li>
        </ul>

        <h2 style={h2}>Beginner strategy tips</h2>
        <ul style={{ ...p, paddingLeft: 22 }}>
          <li style={li}>Don&apos;t rely on a single plan. You can&apos;t choose which piece moves, so keep several pieces useful at once.</li>
          <li style={li}>Keep your king safe early. A King card is rare, so you can&apos;t count on stepping out of check with it. Block checks and guard key squares in advance.</li>
          <li style={li}>Make your Joker count. When you draw one, use it for a capture, a check or an escape, not just another pawn push.</li>
          <li style={li}>Think about the cards your opponent might draw. Pieces left undefended are easy targets when the right card shows up.</li>
          <li style={li}>Start with the bot, then move to <Link to="/find-opponent" style={{ color: link }}>online matchmaking</Link> once the card-to-piece table feels natural.</li>
        </ul>

        <h2 style={h2}>Frequently asked questions</h2>
        {HOW_TO_PLAY_FAQS.map((faq) => (
          <div key={faq.question} style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 4px', color: heading }}>{faq.question}</h3>
            <p style={{ ...p, margin: 0 }}>{faq.answer}</p>
          </div>
        ))}

        <p style={{ ...p, marginTop: 28 }}>
          <Link to="/play" style={{ color: link, fontWeight: 600 }}>Start a game of Card Chess</Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
};
