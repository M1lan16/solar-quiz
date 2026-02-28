import { ANALYTICS_CONFIG } from './analytics-config';

// Type definitions for window objects
declare global {
    interface Window {
        dataLayer: any[];
        fbq: any;
        clarity: any;
    }
}

/**
 * Tracks a custom event across all analytics platforms.
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

/**
 * Lead Content Synchronization for n8n/CRM
 * Single Submission Mode: Sends the full payload at the end of the quiz.
 */
export const syncLeadData = async (data: Record<string, any>) => {
    try {
        await fetch(ANALYTICS_CONFIG.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    } catch (error) {
        console.error('[Sync] Final lead submission failed:', error);
    }
};
