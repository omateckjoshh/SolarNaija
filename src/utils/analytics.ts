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

// Facebook Pixel helpers
export function initFacebookPixel(pixelId?: string) {
  try {
    const win = window as any;
    if (!pixelId) return;
    if (win.fbq) return; // already initialized

    // Standard FB pixel snippet
    !(function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(win, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    win.fbq('init', pixelId);
    win.fbq('consent', 'grant');
  } catch (err) {
    console.debug('initFacebookPixel error', err);
  }
}

export function trackFacebookPurchase(options: { value?: number; currency?: string; content_ids?: string[]; [k: string]: any } = {}) {
  try {
    const win = window as any;
    if (win.fbq && typeof win.fbq === 'function') {
      win.fbq('track', 'Purchase', {
        value: options.value || 0,
        currency: options.currency || 'NGN',
        content_ids: options.content_ids || [],
        ...options
      });
    }
  } catch (err) {
    console.debug('trackFacebookPurchase error', err);
  }
}

// High-level purchase tracker: pushes to dataLayer/gtag and FB pixel
export function trackPurchase(payload: { value: number; currency?: string; content_ids?: string[]; reference?: string } ) {
  try {
    const { value, currency = 'NGN', content_ids = [], reference } = payload;
    // Generic event for GTM/gtag
    trackEvent('purchase', { value, currency, content_ids, reference });

    // Facebook pixel
    trackFacebookPurchase({ value, currency, content_ids, reference });
  } catch (err) {
    console.debug('trackPurchase error', err);
  }
}
