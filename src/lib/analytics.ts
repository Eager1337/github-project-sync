/**
 * Google Analytics 4. The measurement ID is stored in site_settings (key: ga_measurement_id)
 * and set from Admin → Settings, or via the VITE_GA_MEASUREMENT_ID env var on Vercel.
 */
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loadedId: string | null = null;

export function initAnalytics(measurementId?: string | null) {
  const id = measurementId || (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined);
  if (!id || loadedId === id || typeof document === 'undefined') return;
  loadedId = id;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: false });
}

export function trackPageView(path: string) {
  window.gtag?.('event', 'page_view', { page_path: path, page_location: window.location.href, page_title: document.title });
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  window.gtag?.('event', name, params);
}
