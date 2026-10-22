/**
 * Módulo de telemetria analítica com conformidade LGPD.
 * Carrega scripts de mensuração (GA4, GTM, Pixel) SOMENTE com consentimento
 * e apenas se as respectivas variáveis de ambiente com prefixo VITE_ existirem.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export type AnalyticsConsent = 'granted' | 'denied' | 'pending';

const CONSENT_STORAGE_KEY = 'gm_cookie_consent_v1';

export function getStoredConsent(): AnalyticsConsent {
  try {
    const val = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (val === 'granted' || val === 'denied') return val;
  } catch {
    // localStorage indisponível
  }
  return 'pending';
}

export function setStoredConsent(consent: 'granted' | 'denied'): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, consent);
  } catch {
    // ignorar erro
  }
}

export function hasAnalyticsConfigured(): boolean {
  const ga4 = import.meta.env.VITE_GA4_ID;
  const gtm = import.meta.env.VITE_GTM_ID;
  const pixel = import.meta.env.VITE_META_PIXEL_ID;
  return Boolean(ga4 || gtm || pixel);
}

export function initAnalyticsIfConsented(): void {
  const consent = getStoredConsent();
  if (consent !== 'granted') return;

  const ga4Id = import.meta.env.VITE_GA4_ID;
  const gtmId = import.meta.env.VITE_GTM_ID;
  const pixelId = import.meta.env.VITE_META_PIXEL_ID;

  // Inicializa GA4 se configurado
  if (ga4Id && !document.getElementById('ga4-script')) {
    const script = document.createElement('script');
    script.id = 'ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', ga4Id);
  }

  // Inicializa GTM se configurado
  if (gtmId && !document.getElementById('gtm-script')) {
    const script = document.createElement('script');
    script.id = 'gtm-script';
    script.async = true;
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
    document.head.appendChild(script);
  }

  // Inicializa Meta Pixel se configurado
  if (pixelId && !document.getElementById('pixel-script')) {
    const script = document.createElement('script');
    script.id = 'pixel-script';
    script.innerHTML = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`;
    document.head.appendChild(script);
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  // Envia para dataLayer sem dados pessoais
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params,
      timestamp: new Date().toISOString(),
    });

    if (window.gtag) {
      window.gtag('event', eventName, params);
    }
  }
}
