/**
 * Módulo de telemetria analítica com conformidade estrita LGPD e Google Consent Mode v2.
 * Carrega scripts de mensuração (GA4, GTM, Meta Pixel) SOMENTE com consentimento prévio
 * e apenas se as respectivas variáveis de ambiente com prefixo VITE_ existirem.
 * Previne duplicidade de tags, múltiplos disparos acidentais e vazamento de dados pessoais (PII).
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

export type AnalyticsConsent = 'granted' | 'denied' | 'pending';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt?: string;
}

const CONSENT_STORAGE_KEY = 'gm_cookie_consent_v1';
const PREFERENCES_STORAGE_KEY = 'gm_cookie_preferences_v2';

// Lista de chaves restritas para proteção contra envio de PII a plataformas analíticas
const FORBIDDEN_PII_KEYS = new Set([
  'name',
  'nome',
  'phone',
  'telefone',
  'whatsapp',
  'email',
  'cpf',
  'cnpj',
  'placa',
  'plate',
  'address',
  'endereco',
]);

/**
 * Remove dados identificáveis para respeitar estritamente a LGPD e termos do Google/Meta
 */
function sanitizeEventParams(params?: Record<string, unknown>): Record<string, unknown> {
  if (!params) return {};
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    const lowerKey = key.toLowerCase();
    if (FORBIDDEN_PII_KEYS.has(lowerKey)) {
      continue;
    }
    if (typeof value === 'string' && value.length > 100) {
      cleaned[key] = value.slice(0, 100);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

export function getCookiePreferences(): CookiePreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        necessary: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
        updatedAt: parsed.updatedAt,
      };
    }
  } catch {
    // fallback
  }

  // Compatibilidade com v1 se já houver consentimento simples
  const legacy = getStoredConsent();
  if (legacy === 'granted') {
    return { necessary: true, analytics: true, marketing: true };
  } else if (legacy === 'denied') {
    return { necessary: true, analytics: false, marketing: false };
  }

  return { necessary: true, analytics: false, marketing: false };
}

export function saveCookiePreferences(prefs: { analytics: boolean; marketing: boolean }): void {
  const payload: CookiePreferences = {
    necessary: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(payload));
    setStoredConsent(prefs.analytics || prefs.marketing ? 'granted' : 'denied');
  } catch {
    // ignorar erro de storage restrito
  }

  updateConsentMode(payload);
}

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

/**
 * Garante que a fila do dataLayer e a função global gtag existam sem sobrescrever instâncias ativas
 */
function ensureGtagStub(): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  }
}

/**
 * Configura o estado padrão do Google Consent Mode v2 antes do disparo de tags
 */
export function setupDefaultConsentMode(): void {
  if (typeof window === 'undefined') return;
  ensureGtagStub();

  const prefs = getCookiePreferences();
  const consent = getStoredConsent();
  const isGranted = consent === 'granted';

  window.gtag!('consent', 'default', {
    analytics_storage: isGranted && prefs.analytics ? 'granted' : 'denied',
    ad_storage: isGranted && prefs.marketing ? 'granted' : 'denied',
    ad_user_data: isGranted && prefs.marketing ? 'granted' : 'denied',
    ad_personalization: isGranted && prefs.marketing ? 'granted' : 'denied',
    wait_for_update: 500,
  });
}

/**
 * Atualiza o consentimento em tempo real quando o usuário aceita ou altera preferências
 */
export function updateConsentMode(prefs: CookiePreferences): void {
  if (typeof window === 'undefined') return;
  ensureGtagStub();

  window.gtag!('consent', 'update', {
    analytics_storage: prefs.analytics ? 'granted' : 'denied',
    ad_storage: prefs.marketing ? 'granted' : 'denied',
    ad_user_data: prefs.marketing ? 'granted' : 'denied',
    ad_personalization: prefs.marketing ? 'granted' : 'denied',
  });

  // Se o usuário desativou analytics explicitamente, ativa flag de opt-out global do GA4
  const ga4Id = import.meta.env.VITE_GA4_ID;
  if (ga4Id) {
    if (!prefs.analytics) {
      window[`ga-disable-${ga4Id}`] = true;
    } else {
      delete window[`ga-disable-${ga4Id}`];
    }
  }
}

/**
 * Carrega dinamicamente os scripts do GA4, GTM e Meta Pixel conforme consentimento e env vars
 */
export function initAnalyticsIfConsented(): void {
  if (typeof window === 'undefined') return;

  const consent = getStoredConsent();
  if (consent !== 'granted') return;

  const prefs = getCookiePreferences();
  const ga4Id = import.meta.env.VITE_GA4_ID;
  const gtmId = import.meta.env.VITE_GTM_ID;
  const pixelId = import.meta.env.VITE_META_PIXEL_ID;

  // Atualiza Google Consent Mode v2 com escolhas ativas
  updateConsentMode(prefs);

  // Inicializa GA4 se configurado e com consentimento analítico
  // Previne injeção duplicada se GTM estiver presente (GTM deve gerenciar tags GA4 quando ambos existem)
  if (prefs.analytics && ga4Id && !document.getElementById('ga4-script')) {
    const script = document.createElement('script');
    script.id = 'ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    document.head.appendChild(script);

    ensureGtagStub();
    window.gtag!('js', new Date());
    window.gtag!('config', ga4Id, {
      send_page_view: true,
      anonymize_ip: true,
    });
  }

  // Inicializa GTM se configurado e com consentimento analítico
  if (prefs.analytics && gtmId && !document.getElementById('gtm-script')) {
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

  // Inicializa Meta Pixel se configurado e com consentimento de marketing
  if (prefs.marketing && pixelId && !document.getElementById('pixel-script')) {
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

/**
 * Disparo centralizado de eventos analíticos customizados
 * Respeita preferências de consentimento, higieniza parâmetros PII e evita duplicações
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;

  const prefs = getCookiePreferences();
  const consent = getStoredConsent();

  // Se consentimento foi explicitamente negado ou nem analytics nem marketing foram autorizados
  if (consent === 'denied' || (!prefs.analytics && !prefs.marketing)) {
    return;
  }

  const safeParams = sanitizeEventParams(params);

  // Envia ao dataLayer para escuta de GTM
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...safeParams,
    timestamp: new Date().toISOString(),
  });

  // Envia diretamente ao GA4 apenas se gtag estiver ativo
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, safeParams);
  }

  // Mapeia eventos correspondentes no Meta Pixel se autorizado
  if (typeof window.fbq === 'function' && prefs.marketing) {
    if (eventName === 'generate_lead') {
      window.fbq('track', 'Lead');
    } else if (eventName === 'whatsapp_click' || eventName === 'phone_click') {
      window.fbq('track', 'Contact');
    } else {
      window.fbq('trackCustom', eventName, safeParams);
    }
  }
}

/**
 * Eventos padronizados de conversão e micro-conversão para campanhas pagas (Google Ads, Meta Ads)
 */

export function trackWhatsAppConversion(section: string, additionalParams?: Record<string, unknown>): void {
  trackEvent('whatsapp_click', {
    section,
    channel: 'whatsapp',
    ...additionalParams,
  });
}

export function trackPhoneConversion(section: string): void {
  trackEvent('phone_click', {
    section,
    channel: 'telephone',
  });
}

export function trackLeadSubmission(params: {
  service: string;
  isInsurance: string;
  hasYear: boolean;
  partsCount: number;
  hasNotes: boolean;
}): void {
  trackEvent('generate_lead', {
    service_type: params.service,
    is_insurance: params.isInsurance,
    has_vehicle_year: params.hasYear,
    damaged_parts_count: params.partsCount,
    has_damage_notes: params.hasNotes,
    conversion_type: 'quote_form',
  });
}

