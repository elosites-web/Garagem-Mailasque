/**
 * Módulo de telemetria analítica com conformidade estrita LGPD e Google Consent Mode v2.
 * Arquitetura baseada no Google Tag Manager (GTM) como CONTAINER ÚNICO de tags.
 * GA4 e Google Ads são orquestrados internamente pelo GTM, sem injeção direta de scripts gtag.js ou Meta Pixel.
 * Carrega o GTM SOMENTE após o visitante conceder consentimento prévio e se VITE_GTM_ID estiver configurado.
 * Previne duplicidade de eventos, bloqueia vazamento de PII e respeita escolhas individuais de consentimento.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
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

// Lista de chaves restritas para proteção estrita contra envio de PII a plataformas analíticas
export const FORBIDDEN_PII_KEYS = new Set([
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
 * Remove dados identificáveis para respeitar a LGPD e termos do Google Ads/GA4
 */
export function sanitizeEventParams(params?: Record<string, unknown>): Record<string, unknown> {
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

export function getGtmId(): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GTM_ID) {
    return import.meta.env.VITE_GTM_ID;
  }
  if (typeof process !== 'undefined' && process.env?.VITE_GTM_ID) {
    return process.env.VITE_GTM_ID;
  }
  return undefined;
}

export function hasAnalyticsConfigured(): boolean {
  return Boolean(getGtmId());
}

/**
 * Garante que a fila do dataLayer e a função global gtag existam sem sobrescrever instâncias ativas
 */
export function ensureGtagStub(): void {
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
 * Configura o estado padrão do Google Consent Mode v2 antes do disparo de quaisquer tags.
 * Deve ser chamado antes de carregar o GTM para que a inicialização do container
 * leia os sinais de consentimento prévio ou negado.
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
 * Atualiza o consentimento em tempo real quando o usuário aceita, personaliza ou revoga opções
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
}

/**
 * Carrega dinamicamente o script do Google Tag Manager (GTM)
 * SOMENTE se houver consentimento para pelo menos uma categoria opcional
 * e se VITE_GTM_ID estiver configurado no ambiente.
 *
 * NOTA DE ARQUITETURA:
 * O GTM é o único proprietário de tags (Single Tag Owner).
 * Nenhum script direto de GA4 (gtag.js) ou Meta Pixel é injetado.
 * A conformidade com LGPD depende também de configurações de 'Consentimento de Tag' no GTM.
 */
export function initAnalyticsIfConsented(): void {
  if (typeof window === 'undefined') return;

  const consent = getStoredConsent();
  if (consent !== 'granted') return;

  const prefs = getCookiePreferences();
  if (!prefs.analytics && !prefs.marketing) return;

  const gtmId = getGtmId();
  if (!gtmId) return;

  // Atualiza Google Consent Mode v2 com escolhas ativas
  updateConsentMode(prefs);

  if (!document.getElementById('gtm-script')) {
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
}

/**
 * Disparo centralizado de eventos analíticos no dataLayer.
 *
 * Estratégia Single Tag Owner (GTM):
 * - Envia eventos exclusivamente via window.dataLayer.push({ event, ...params })
 * - Não efetua chamadas diretas via window.gtag('event') ou window.fbq()
 * - Se o consentimento não foi concedido ou foi revogado, bloqueia o envio imediatamente
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;

  const consent = getStoredConsent();
  const prefs = getCookiePreferences();

  // Bloqueio rigoroso: não dispara eventos se o consentimento não foi concedido ou se ambas as categorias opcionais foram recusadas
  if (consent !== 'granted' || (!prefs.analytics && !prefs.marketing)) {
    return;
  }

  const safeParams = sanitizeEventParams(params);

  // Envia exclusivamente ao dataLayer para orquestração pelo GTM
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...safeParams,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Conversão Primária do Site: Clique real de saída para o WhatsApp.
 * Deve ser configurado como Key Event no GA4 e Tag de Conversão no Google Ads via GTM.
 * Não coleta mensagens, nomes ou números de telefone.
 */
export function trackWhatsAppConversion(section: string, additionalParams?: Record<string, unknown>): void {
  trackEvent('whatsapp_click', {
    section,
    channel: 'whatsapp',
    ...additionalParams,
  });
}

/**
 * Conversão Secundária: Clique no telefone fixo/celular
 */
export function trackPhoneConversion(section: string): void {
  trackEvent('phone_click', {
    section,
    channel: 'telephone',
  });
}

/**
 * Registro de envio de formulário de cotação:
 * Representa um lead técnico que solicitou orçamento e foi direcionado ao WhatsApp.
 * Mantido como evento separado ('generate_lead') da conversão primária de clique direto ('whatsapp_click').
 * Não coleta nem transmite nome, telefone, placa ou texto da mensagem.
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
