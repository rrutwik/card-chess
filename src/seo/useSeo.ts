import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HOW_TO_PLAY_FAQS } from './faqs';
import { jsonLdForPath, setRouteJsonLd } from './jsonld';
import { DEFAULT_OG_IMAGE, SITE_URL, getSeoForPath, normalizePath } from './routes';

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string | null): void {
  const existing = document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');
  if (href === null) {
    existing.forEach((el) => el.remove());
    return;
  }
  // Always exactly one canonical tag.
  existing.forEach((el, index) => {
    if (index > 0) el.remove();
  });
  let el = existing[0];
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Updates the tags that already exist in index.html (title, description, canonical, robots,
 * Open Graph, Twitter) for the current route. Mount once, inside the Router.
 */
export function useSeo(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = normalizePath(pathname);
    const seo = getSeoForPath(path);
    const url = `${SITE_URL}${path === '/' ? '/' : path}`;

    document.title = seo.title;
    upsertMeta('meta[name="description"]', 'name', 'description', seo.description);
    upsertMeta('meta[name="robots"]', 'name', 'robots', seo.indexable ? 'index, follow' : 'noindex, follow');
    setCanonical(seo.canonical ? url : null);

    upsertMeta('meta[property="og:title"]', 'property', 'og:title', seo.title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', seo.description);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', DEFAULT_OG_IMAGE);
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', seo.title);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', seo.description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', DEFAULT_OG_IMAGE);

    setRouteJsonLd(jsonLdForPath(path, HOW_TO_PLAY_FAQS));
  }, [pathname]);
}
