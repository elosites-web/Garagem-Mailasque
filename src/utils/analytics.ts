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

export const CONSENT_STORAGE_KEY = 'gm_cookie_consent_v1';
export const PREFERENCES_STORAGE_KEY = 'gm_cookie_preferences_v2';
export const CONSENT_EVENT_NAME = 'cookie_consent_updated';

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
  'message',
  'mensagem',
  'texto',
  'customtext',
  'notes',
  'observacoes',
]);

/**
 * Remove dados identificáveis para respeitar a LGPD e termos do Google/Meta
 */
function sanitizeEventParams(params?: Record<string, unknown>): Record<string, unknown> {
  if (!params) return {};
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    const lowerKey = key.toLowerCase();
    if (FORBIDDEN_PII_KEYS.has(lowerKey)) {
      continue;
    }
    if (typeof value === 'string') {
      cleaned[key] = value.slice(0, 100);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

/**
 * Obtém as preferências salvas no localStorage
 */
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') {
    return { necessary: true, analytics: false, marketing: false };
  }

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
  const legacy = getRawStoredConsent();
  if (legacy === 'granted') {
    return { necessary: true, analytics: true, marketing: true };
  } else if (legacy === 'denied') {
    return { necessary: true, analytics: false, marketing: false };
  }

  return { necessary: true, analytics: false, marketing: false };
}

/**
 * Retorna o valor bruto gravado no storage
 */
function getRawStoredConsent(): AnalyticsConsent {
  if (typeof window === 'undefined') return 'pending';
  try {
    const val = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (val === 'granted' || val === 'denied') return val;
  } catch {
    // localStorage indisponível
  }
  return 'pending';
}

/**
 * Retorna o status de consentimento garantindo consistência entre status e preferências
 */
export function getStoredConsent(): AnalyticsConsent {
  const rawStatus = getRawStoredConsent();
  if (rawStatus === 'pending') return 'pending';

  const prefs = getCookiePreferences();
  // Se o status for 'granted' mas ambas as categorias opcionais estiverem desativadas,
  // trata de forma consistente como 'denied'
  if (rawStatus === 'granted') {
    if (!prefs.analytics && !prefs.marketing) {
      return 'denied';
    }
    return 'granted';
  }

  return 'denied';
}

export function isAnalyticsAllowed(): boolean {
  return getStoredConsent() === 'granted' && getCookiePreferences().analytics;
}

export function isMarketingAllowed(): boolean {
  return getStoredConsent() === 'granted' && getCookiePreferences().marketing;
}

export function setStoredConsent(consent: 'granted' | 'denied'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, consent);
  } catch {
    // ignorar erro de storage
  }
}

/**
 * Salva preferências e dispara evento para sincronização de UI e tags
 */
export function saveCookiePreferences(prefs: { analytics: boolean; marketing: boolean }): void {
  if (typeof window === 'undefined') return;

  const isAnyGranted = prefs.analytics || prefs.marketing;
  const status: AnalyticsConsent = isAnyGranted ? 'granted' : 'denied';

  const payload: CookiePreferences = {
    necessary: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(payload));
    setStoredConsent(status);
  } catch {
    // ignorar erro de storage
  }

  // Atualiza Google Consent Mode v2 imediatamente
  updateConsentMode(payload);

  // Notifica componentes ouvintes (ex: fechamento do banner de cookies)
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT_NAME, { detail: { status, preferences: payload } }));
  } catch {
    // fallback
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

  // Se o usuário alterou marketing e o Meta Pixel estiver carregado, atualiza via API oficial do Meta
  if (typeof window.fbq === 'function') {
    if (!prefs.marketing) {
      window.fbq('consent', 'revoke');
    } else {
      window.fbq('consent', 'grant');
    }
  }
}

/**
 * Carrega dinamicamente os scripts do GA4, GTM e Meta Pixel conforme consentimento e env vars
 * Previne injeção duplicada de tags e configura flags de opt-out quando revogado
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

  // ESTRATÉGIA DE INICIALIZAÇÃO DE TAGS:
  // 1. Se GTM estiver configurado (VITE_GTM_ID), o GTM é o gerenciador de tags orquestrador.
  // 2. Se apenas GA4 direto estiver configurado (sem GTM), inicializa gtag.js com VITE_GA4_ID.
  // 3. Se ambos estiverem presentes, GTM é mantido como o container e gtag.js direto só é carregado
  //    se explicitamente necessário, evitando double pageview e duplicidade.
  if ((prefs.analytics || prefs.marketing) && gtmId && !document.getElementById('gtm-script')) {
    const script = document.createElement('script');
    script.id = 'gtm-script';
    script.async = true;
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
    document.head.appendChild(script);
  } else if (prefs.analytics && ga4Id && !gtmId && !document.getElementById('ga4-script')) {
    // Somente injeta gtag.js direto se GTM NÃO estiver configurado (previne tags duplicadas)
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
 * Estratégia de entrega unificada:
 * - Se GTM estiver ativo (VITE_GTM_ID): envia evento ao window.dataLayer para que o GTM acione as tags
 *   configuradas sem disparar gtag('event') duplicado.
 * - Se apenas GA4 direto estiver ativo: envia via window.gtag('event') se consentimento analítico concedido.
 * - Se Meta Pixel estiver ativo com consentimento: mapeia eventos correspondentes (Contact, Lead, etc.).
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;

  const prefs = getCookiePreferences();
  const consent = getStoredConsent();

  // Bloqueio rigoroso: não dispara eventos se o consentimento não foi concedido
  if (consent !== 'granted' || (!prefs.analytics && !prefs.marketing)) {
    return;
  }

  const safeParams = sanitizeEventParams(params);
  const gtmId = import.meta.env.VITE_GTM_ID;
  const ga4Id = import.meta.env.VITE_GA4_ID;

  // 1. Se GTM estiver configurado, envia ao dataLayer se houver consentimento analítico OU de marketing
  if (gtmId && (prefs.analytics || prefs.marketing)) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...safeParams,
      timestamp: new Date().toISOString(),
    });
  } else if (!gtmId && ga4Id && prefs.analytics && typeof window.gtag === 'function') {
    // 2. Envia diretamente via gtag() SOMENTE se GTM NÃO estiver configurado (previne disparo duplo de GA4)
    window.gtag('event', eventName, safeParams);
  }

  // 3. Mapeia eventos correspondentes no Meta Pixel se marketing concedido
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
 * Eventos padronizados de conversão para campanhas e tráfego pago
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

/**
 * Registro de envio de formulário de cotação.
 * Representa um lead que iniciou a solicitação de orçamento com intenção de contato no WhatsApp,
 * não uma venda confirmada ou conversa concluída.
 * Não coleta nem transmite nome, telefone ou mensagem de texto.
 */
export function trackLeadSubmission(params: {
  service: string;
  isInsurance: string;
  hasYear: boolean;
  partsCount: number;
  hasNotes: boolean;
}): void {
  trackEvent('generate_lead', {
    conversion_type: 'quote_form',
    lead_intent: 'whatsapp_quote_request',
    service_type: params.service,
    is_insurance: params.isInsurance,
    has_vehicle_year: params.hasYear,
    damaged_parts_count: params.partsCount,
    has_damage_notes: params.hasNotes,
  });
}
