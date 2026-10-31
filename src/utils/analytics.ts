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

export const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;

export const BEHAVIORAL_EVENTS = new Set([
  'gallery_open',
  'testimonial_spin',
  'slider_interact',
  'maps_click',
  'simulator_use',
  'chat_widget_toggle',
]);

export const CONVERSION_EVENTS = new Set([
  'whatsapp_click',
  'generate_lead',
  'phone_click',
]);

// Proteção em memória de sessão: impede que falhas de persistência mantenham um consentimento anterior ativo
let persistenceFailureActive = false;

/**
 * Obtém as preferências salvas no localStorage com validação estrita (deny-by-default).
 * - Se gm_cookie_preferences_v2 não existir, estiver corrompido ou não for um objeto válido,
 *   retorna todas as categorias opcionais como false.
 * - Aceita analytics e marketing somente quando o valor for estritamente boolean true.
 * - O registro legado (gm_cookie_consent_v1) nunca eleva permissões granulares.
 * - Se a última tentativa de persistência na sessão falhou, mantém estado restritivo.
 */
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined' || persistenceFailureActive) {
    return { necessary: true, analytics: false, marketing: false };
  }

  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const record = parsed as Record<string, unknown>;
        return {
          necessary: true,
          analytics: record.analytics === true,
          marketing: record.marketing === true,
          updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : undefined,
        };
      }
    }
  } catch {
    // Em caso de JSON inválido ou falha de leitura, mantém opcionais desativados
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
 * Retorna o status de consentimento garantindo consistência entre status, preferências e integridade de persistência
 */
export function getStoredConsent(): AnalyticsConsent {
  if (typeof window === 'undefined') return 'pending';
  if (persistenceFailureActive) return 'denied';

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
  if (persistenceFailureActive) return false;
  return getStoredConsent() === 'granted' && getCookiePreferences().analytics === true;
}

export function isMarketingAllowed(): boolean {
  if (persistenceFailureActive) return false;
  return getStoredConsent() === 'granted' && getCookiePreferences().marketing === true;
}

export function setStoredConsent(consent: 'granted' | 'denied'): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, consent);
    return localStorage.getItem(CONSENT_STORAGE_KEY) === consent;
  } catch {
    return false;
  }
}

/**
 * Salva preferências e dispara evento para sincronização de UI e tags.
 * Retorna true somente quando tanto as preferências granulares quanto o status
 * de consentimento foram persistidos e verificados com sucesso.
 * Em caso de falha de persistência, ativa bloqueio em memória na sessão, tenta reverter/invalidar
 * o armazenamento e aplica imediatamente o estado restritivo (denied) no Consent Mode v2.
 */
export function saveCookiePreferences(prefs: { analytics: boolean; marketing: boolean }): boolean {
  if (typeof window === 'undefined') return false;

  const analytics = prefs.analytics === true;
  const marketing = prefs.marketing === true;
  const isAnyGranted = analytics || marketing;
  const status: AnalyticsConsent = isAnyGranted ? 'granted' : 'denied';

  const payload: CookiePreferences = {
    necessary: true,
    analytics,
    marketing,
    updatedAt: new Date().toISOString(),
  };

  const restrictivePayload: CookiePreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
  };

  const serializedPayload = JSON.stringify(payload);
  const serializedRestrictive = JSON.stringify(restrictivePayload);

  // Ativa proteção em memória antes de iniciar a gravação; só será liberada se toda a operação e verificação tiverem êxito
  persistenceFailureActive = true;

  try {
    // 1. Invalida primeiro qualquer consentimento anterior antes de gravar o novo estado
    localStorage.setItem(PREFERENCES_STORAGE_KEY, serializedPayload);
    localStorage.setItem(CONSENT_STORAGE_KEY, status);

    // 2. Confirmação de leitura pós-gravação
    const storedPrefsRaw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    const storedStatus = localStorage.getItem(CONSENT_STORAGE_KEY);

    if (storedPrefsRaw !== serializedPayload || storedStatus !== status) {
      throw new Error('Consent persistence verification failed');
    }

    // 3. Libera trava em memória e valida a consistência das funções leitoras
    persistenceFailureActive = false;

    const verifiedPrefs = getCookiePreferences();
    const verifiedStatus = getStoredConsent();

    if (
      verifiedPrefs.analytics !== analytics ||
      verifiedPrefs.marketing !== marketing ||
      verifiedStatus !== status
    ) {
      persistenceFailureActive = true;
      throw new Error('Consent reader verification failed');
    }
  } catch {
    persistenceFailureActive = true;

    // Tenta remover chaves parcialmente gravadas; se removeItem falhar, tenta sobrescrever com estado restritivo
    try {
      localStorage.removeItem(PREFERENCES_STORAGE_KEY);
    } catch {
      try {
        localStorage.setItem(PREFERENCES_STORAGE_KEY, serializedRestrictive);
      } catch {
        // ignorar erro ao sobrescrever
      }
    }
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      try {
        localStorage.setItem(CONSENT_STORAGE_KEY, 'denied');
      } catch {
        // ignorar erro ao sobrescrever
      }
    }

    // Aplica imediatamente o estado restritivo (todos os 4 sinais como 'denied')
    updateConsentMode(restrictivePayload);
    return false;
  }

  // Atualiza Google Consent Mode v2 somente após confirmar persistência completa
  updateConsentMode(payload);

  // Notifica componentes ouvintes (ex: fechamento do banner de cookies)
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT_NAME, { detail: { status, preferences: payload } }));
  } catch {
    // fallback
  }

  return true;
}

/**
 * Valida se o ID do GTM segue estritamente o formato oficial GTM-XXXX
 */
export function isValidGtmId(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return GTM_ID_PATTERN.test(trimmed);
}

export function getGtmId(): string | undefined {
  let rawId: unknown;

  if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GTM_ID) {
    rawId = import.meta.env.VITE_GTM_ID;
  } else if (typeof process !== 'undefined' && process.env?.VITE_GTM_ID) {
    rawId = process.env.VITE_GTM_ID;
  }

  if (typeof rawId !== 'string') return undefined;

  const trimmed = rawId.trim();
  if (!GTM_ID_PATTERN.test(trimmed)) {
    return undefined;
  }

  return trimmed;
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

function hasDefaultConsentInDataLayer(): boolean {
  if (typeof window === 'undefined' || !Array.isArray(window.dataLayer)) {
    return false;
  }
  return window.dataLayer.some((entry) => {
    if (!entry || typeof entry !== 'object') return false;
    const args = entry as ArrayLike<unknown>;
    return args[0] === 'consent' && args[1] === 'default';
  });
}

/**
 * Configura o estado padrão do Google Consent Mode v2 antes do disparo de quaisquer tags.
 * Deve ser chamado antes de carregar o GTM para que a inicialização do container
 * leia os sinais de consentimento prévio ou negado.
 * Possui proteção de idempotência para evitar entradas duplicadas de 'consent default'.
 */
export function setupDefaultConsentMode(): void {
  if (typeof window === 'undefined') return;
  ensureGtagStub();

  if (hasDefaultConsentInDataLayer()) {
    return;
  }

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
    analytics_storage: prefs.analytics === true ? 'granted' : 'denied',
    ad_storage: prefs.marketing === true ? 'granted' : 'denied',
    ad_user_data: prefs.marketing === true ? 'granted' : 'denied',
    ad_personalization: prefs.marketing === true ? 'granted' : 'denied',
  });
}

/**
 * Carrega dinamicamente o script do Google Tag Manager (GTM)
 * SOMENTE se houver consentimento válido para pelo menos uma categoria opcional
 * e se VITE_GTM_ID estiver configurado e validado no ambiente.
 *
 * NOTA DE ARQUITETURA:
 * O GTM é o único proprietário de tags (Single Tag Owner).
 * Nenhum script direto de GA4 (gtag.js) ou Meta Pixel é injetado.
 * A conformidade com LGPD depende também de configurações de 'Consentimento de Tag' no GTM.
 */
export function initAnalyticsIfConsented(): void {
  if (typeof window === 'undefined') return;

  if (!isAnalyticsAllowed() && !isMarketingAllowed()) return;

  const gtmId = getGtmId();
  if (!gtmId) return;

  const prefs = getCookiePreferences();

  // Atualiza Google Consent Mode v2 com escolhas ativas
  updateConsentMode(prefs);

  if (!document.getElementById('gtm-script')) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });

    const script = document.createElement('script');
    script.id = 'gtm-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
    document.head.appendChild(script);
  }
}

/**
 * Disparo centralizado de eventos analíticos e de conversão no dataLayer.
 *
 * Estratégia Single Tag Owner (GTM):
 * - Envia eventos exclusivamente via window.dataLayer.push({ event, ...params })
 * - Eventos comportamentais exigem exclusivamente isAnalyticsAllowed()
 * - Eventos de conversão exigem isAnalyticsAllowed() || isMarketingAllowed()
 * - Eventos desconhecidos são bloqueados por padrão
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;

  if (CONVERSION_EVENTS.has(eventName)) {
    if (!isAnalyticsAllowed() && !isMarketingAllowed()) {
      return;
    }
  } else if (BEHAVIORAL_EVENTS.has(eventName)) {
    if (!isAnalyticsAllowed()) {
      return;
    }
  } else {
    // Eventos desconhecidos são bloqueados por segurança
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
