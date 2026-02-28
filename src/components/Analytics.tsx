import React, { useEffect } from 'react';
import { ANALYTICS_CONFIG } from '../lib/analytics-config';
import { getLeadSession } from '../lib/analytics';

export const Analytics: React.FC = () => {
    // Session State Management (Persistence)
    useEffect(() => {
        // Initialize or restore session on mount
        const session = getLeadSession();
        if (session.email) {
            console.log('[Analytics] Session restored for lead:', session.email);
        }

        // --- 1. Microsoft Clarity ---
        (function (c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
            t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", ANALYTICS_CONFIG.CLARITY_ID);

        // --- 2. Meta Pixel ---
        (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
            if (f.fbq) return; n = f.fbq = function () {
                n.callMethod ?
                    n.callMethod.apply(n, arguments) : n.queue.push(arguments)
            };
            if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
            n.queue = []; t = b.createElement(e); t.async = !0;
            t.src = v; s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s)
        }(window, document, 'script',
            'https://connect.facebook.net/en_US/fbevents.js'));

        if ((window as any).fbq) {
            (window as any).fbq('init', ANALYTICS_CONFIG.FB_PIXEL_ID);
            (window as any).fbq('track', 'PageView');
        }

        // --- 3. Google Tag Manager (Script) ---
        (function (w: any, d: any, s: any, l: any, i: any) {
            w[l] = w[l] || [];
            w[l].push({
                'gtm.start':
                    new Date().getTime(), event: 'gtm.js'
            }); var f = d.getElementsByTagName(s)[0],
                j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
                    'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', ANALYTICS_CONFIG.GTM_ID);

    }, []);

    return (
        <>
            {/* Google Tag Manager (NoScript) - Body Injection */}
            <noscript>
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${ANALYTICS_CONFIG.GTM_ID}`}
                    height="0"
                    width="0"
                    style={{ display: 'none', visibility: 'hidden' }}
                />
            </noscript>

            {/* Meta Pixel (NoScript) */}
            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: 'none' }}
                    src={`https://www.facebook.com/tr?id=${ANALYTICS_CONFIG.FB_PIXEL_ID}&ev=PageView&noscript=1`}
                />
            </noscript>
        </>
    );
};
