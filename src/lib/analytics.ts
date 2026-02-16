// Type definitions for window objects
declare global {
    interface Window {
        dataLayer: any[];
        fbq: any;
        clarity: any;
    }
}

/**
 * Tracks a custom event across all configured analytics platforms.
 * @param eventName The name of the event (e.g., 'LeadSubmitted', 'ContactPreferenceSelected')
 * @param params Optional parameters to send with the event
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
    // 1. Google Tag Manager (dataLayer)
    if (window.dataLayer) {
        window.dataLayer.push({
            event: eventName,
            ...params,
        });
    }

    // 2. Meta Pixel (fbq)
    if (window.fbq) {
        window.fbq('track', eventName, params);
    }

    // 3. Microsoft Clarity
    if (window.clarity) {
        window.clarity('event', eventName);
    }

    // Log for development
    // @ts-ignore
    if (import.meta.env.DEV) {
        console.log(`[Analytics] Tracked: ${eventName}`, params);
    }
};
