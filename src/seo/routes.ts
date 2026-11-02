export const SITE_URL = 'https://cardchess.techkarmic.com';
export const SITE_NAME = 'Card Chess';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export interface SeoConfig {
  /** Text for the <title> element. Keep it under ~60 characters, brand last. */
  title: string;
  /** Meta description, 120-160 characters, unique per page. */
  description: string;
  /** false => <meta name="robots" content="noindex"> (public/_headers also sends X-Robots-Tag). */
  indexable: boolean;
  /** false => no canonical link (used for the not-found view). */
  canonical: boolean;
}

/**
 * Exact-path SEO config. Indexable URLs here must also be listed in public/sitemap.xml,
 * and non-indexable app screens must also have an X-Robots-Tag rule in public/_headers.
 */
const ROUTE_SEO: Record<string, SeoConfig> = {
  '/': {
    title: 'Card Chess — Chess Meets Cards | Free Online Strategy Game',
    description:
      'Card Chess is a free online strategy game that combines chess with playing cards. Draw cards to decide which piece you can move. Play vs a bot or challenge a friend.',
    indexable: true,
    canonical: true,
  },
  '/how-to-play': {
    title: 'How to Play Card Chess: Rules, Cards & Pieces | Card Chess',
    description:
      'Learn the Card Chess rules: how each playing card decides which chess piece you can move, how pawns, jokers and check work, plus beginner strategy tips.',
    indexable: true,
    canonical: true,
  },
  '/play': {
    title: 'Play Card Chess Online Free vs Bot | Card Chess',
    description:
      'Play Card Chess free in your browser. Draw a card, move the matching piece and try to beat the bot. No download needed.',
    indexable: true,
    canonical: true,
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Card Chess',
    description:
      'Read the Card Chess privacy policy: what information we collect, how it is used and the choices you have.',
    indexable: true,
    canonical: true,
  },
  '/login': {
    title: 'Log In | Card Chess',
    description: 'Log in to Card Chess to save your games and play online.',
    indexable: false,
    canonical: true,
  },
  '/games': {
    title: 'Your Active Games | Card Chess',
    description: 'Your active Card Chess games.',
    indexable: false,
    canonical: true,
  },
  '/history': {
    title: 'Game History | Card Chess',
    description: 'Your finished Card Chess games.',
    indexable: false,
    canonical: true,
  },
  '/find-opponent': {
    title: 'Find an Opponent | Card Chess',
    description: 'Quick matchmaking for Card Chess.',
    indexable: false,
    canonical: true,
  },
};

const GAME_SEO: SeoConfig = {
  title: 'Card Chess Game | Card Chess',
  description: 'A Card Chess game in progress.',
  indexable: false,
  canonical: true,
};

export const NOT_FOUND_SEO: SeoConfig = {
  title: 'Page Not Found | Card Chess',
  description: 'This page does not exist. Head back to Card Chess to play.',
  indexable: false,
  canonical: false,
};

/** Normalises a pathname: no trailing slash (except "/"), no query/hash. */
export function normalizePath(pathname: string): string {
  const path = pathname.split(/[?#]/)[0] || '/';
  return path.length > 1 ? path.replace(/\/+$/, '') : '/';
}

export function getSeoForPath(pathname: string): SeoConfig {
  const path = normalizePath(pathname);
  if (ROUTE_SEO[path]) return ROUTE_SEO[path];
  if (/^\/game\/[^/]+$/.test(path)) return GAME_SEO;
  return NOT_FOUND_SEO;
}
