import { SITE_NAME, SITE_URL } from './routes';

type JsonLd = Record<string, unknown>;

const ATTR = 'data-seo-jsonld';

/** Replaces every route-level JSON-LD block with `blocks` (the static ones in index.html are untouched). */
export function setRouteJsonLd(blocks: JsonLd[]): void {
  document.head.querySelectorAll(`script[${ATTR}]`).forEach((el) => el.remove());
  for (const block of blocks) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(ATTR, '');
    script.textContent = JSON.stringify(block);
    document.head.appendChild(script);
  }
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === '/' ? '/' : item.path}`,
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/** JSON-LD blocks for a given path, or [] when the page has none. */
export function jsonLdForPath(path: string, faqs: { question: string; answer: string }[]): JsonLd[] {
  if (path === '/how-to-play') {
    return [
      breadcrumbJsonLd([
        { name: SITE_NAME, path: '/' },
        { name: 'How to Play', path: '/how-to-play' },
      ]),
      faqJsonLd(faqs),
    ];
  }
  return [];
}
