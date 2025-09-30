export type AnalyticsPayload = Record<string, any>;

export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  try {
    const win = window as any;
    // Preferred: push to dataLayer (Google Tag Manager)
    if (win.dataLayer && typeof win.dataLayer.push === 'function') {
      win.dataLayer.push({ event: eventName, ...payload });
      return;
    }

    // Fallback: gtag
    if (typeof win.gtag === 'function') {
      win.gtag('event', eventName, payload);
      return;
    }

    // Final fallback: console for dev visibility
    console.debug('[trackEvent]', eventName, payload);
  } catch (err) {
    console.debug('trackEvent error', err);
  }
}
