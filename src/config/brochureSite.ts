/** Public brochure URL (GitHub Pages). Override via VITE_BROCHURE_SITE_URL at build time. */
export const BROCHURE_SITE_URL =
  import.meta.env.VITE_BROCHURE_SITE_URL?.replace(/\/$/, '') ||
  (typeof window !== 'undefined'
    ? `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}`
    : '');

export const IS_BROCHURE_ONLY = import.meta.env.VITE_BROCHURE_ONLY === 'true';

export const assetBase = import.meta.env.BASE_URL;
