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
 * Persisted Session State for the Lead
 * This ensures that once the email is collected in Step 8, 
 * it stays available throughout the entire session.
 */
const LEAD_SESSION_KEY = 'sed_lead_session';

export const getLeadSession = (): { email?: string; contactPreference?: string } => {
    try {
        const saved = localStorage.getItem(LEAD_SESSION_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
};

export const updateLeadSession = (data: Partial<{ email: string; contactPreference: string }>) => {
    const current = getLeadSession();
    const updated = { ...current, ...data };
    localStorage.setItem(LEAD_SESSION_KEY, JSON.stringify(updated));
};

/**
 * Tracks a custom event across all analytics platforms.
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
    const session = getLeadSession();
    // Enriched parameters with persistent session info if available
    const enrichedParams = {
        ...params,
        email: params?.email || session.email,
        contactPreference: params?.contactPreference || session.contactPreference,
    };

    // 1. Google Tag Manager (dataLayer)
    if (window.dataLayer) {
        window.dataLayer.push({
            event: eventName,
            ...enrichedParams,
        });
    }

    // 2. Meta Pixel (fbq)
    if (window.fbq) {
        window.fbq('track', eventName, enrichedParams);
    }

    // 3. Microsoft Clarity
    if (window.clarity) {
        window.clarity('event', eventName);
    }

    // Log for development
    // @ts-ignore
    if (import.meta.env.DEV) {
        console.log(`[Analytics] Tracked: ${eventName}`, enrichedParams);
    }
};

/**
 * Real-time Lead Content Synchronization for n8n/CRM
 * This ensures that every update sent to n8n after Step 8 includes the primary 'email' key.
 */
export const syncLeadData = async (data: Record<string, any>) => {
    const session = getLeadSession();
    const emailToUse = data.email || session.email;

    // MANDATORY: Skip if no email is collected, as n8n cannot identify the record
    if (!emailToUse) {
        console.warn('[Sync] Skipping lead update: missing email lookup key.');
        return;
    }

    // Update session state with incoming values (to keep Step 9 preference for Step 10 payload)
    if (data.email) updateLeadSession({ email: data.email });
    if (data.contactPreference) updateLeadSession({ contactPreference: data.contactPreference });

    const updatedSession = getLeadSession();

    // Consolidate payload: Always include the lookup key (email) + session context
    const payload = {
        ...data,
        email: emailToUse,
        contactPreference: data.contactPreference || updatedSession.contactPreference,
    };

    try {
        fetch(ANALYTICS_CONFIG.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    } catch (error) {
        console.error('[Sync] Final lead sync failed:', error);
    }
};
