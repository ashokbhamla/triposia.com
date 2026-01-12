export interface GA4EventParams {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(eventName: string, params?: GA4EventParams): void {
  if (typeof window === 'undefined') return;
  
  if (window.gtag && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

