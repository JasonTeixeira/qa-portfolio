'use client'

import Script from 'next/script'

const CONSENT_STORAGE_KEY = 'sage-cookie-consent-v1'
const CONSENT_EVENT = 'sage:cookie-consent'
const DEFAULT_GA4_MEASUREMENT_ID = 'G-PS7LKSEGVW'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || DEFAULT_GA4_MEASUREMENT_ID
  const requireConsent = process.env.NEXT_PUBLIC_GA4_REQUIRE_CONSENT === 'true'
  if (process.env.NODE_ENV !== 'production' || !measurementId) return null

  return (
    <>
      <Script
        id="ga4-consent"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            window.__sageGa4RequireConsent = ${JSON.stringify(requireConsent)};
            window.__sageGa4AnalyticsConsent = function(value){
              if (!window.__sageGa4RequireConsent) return 'granted';
              return value === 'accepted' ? 'granted' : 'denied';
            };
            window.__sageGa4StoredConsent = function(){
              try { return localStorage.getItem('${CONSENT_STORAGE_KEY}'); }
              catch(e) { return null; }
            };
            gtag('consent', 'default', {
              analytics_storage: window.__sageGa4AnalyticsConsent(window.__sageGa4StoredConsent()),
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied'
            });
          `,
        }}
      />
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script
        id="ga4-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              send_page_view: true,
              anonymize_ip: true,
              cookie_flags: 'SameSite=Lax;Secure'
            });
            window.__sageGa4UpdateConsent = function(value) {
              gtag('consent', 'update', {
                analytics_storage: window.__sageGa4AnalyticsConsent(value)
              });
            };
            window.addEventListener('storage', function(event) {
              if (event.key !== '${CONSENT_STORAGE_KEY}') return;
              window.__sageGa4UpdateConsent(event.newValue);
            });
            window.addEventListener('${CONSENT_EVENT}', function(event) {
              window.__sageGa4UpdateConsent(event.detail && event.detail.consent);
            });
            gtag('consent', 'update', {
              analytics_storage: window.__sageGa4AnalyticsConsent(window.__sageGa4StoredConsent())
            });
          `,
        }}
      />
    </>
  )
}
