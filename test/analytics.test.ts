import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Mock do ambiente de browser para o Node.js
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

class MockElement {
  id = '';
  async = false;
  innerHTML = '';
  src = '';
}

const mockHead = {
  children: [] as MockElement[],
  appendChild(el: MockElement) {
    this.children.push(el);
    return el;
  },
};

const mockDocument = {
  head: mockHead,
  getElementById(id: string): MockElement | null {
    return mockHead.children.find((c) => c.id === id) || null;
  },
  createElement(tag: string): MockElement {
    if (tag === 'script') {
      return new MockElement();
    }
    return new MockElement();
  },
  getElementsByTagName(tag: string) {
    if (tag === 'script') {
      return [new MockElement()];
    }
    return [];
  },
};

const listeners: Record<string, ((e: unknown) => void)[]> = {};

// Instalação do ambiente global mockado
const mockStorage = new MockLocalStorage();
(globalThis as unknown as { localStorage: MockLocalStorage }).localStorage = mockStorage;
(globalThis as unknown as { document: typeof mockDocument }).document = mockDocument;

const mockWindow = {
  dataLayer: [] as unknown[],
  gtag: undefined as unknown,
  localStorage: mockStorage,
  document: mockDocument,
  dispatchEvent(event: { type: string; detail?: unknown }) {
    const handlers = listeners[event.type] || [];
    handlers.forEach((h) => h(event));
    return true;
  },
  addEventListener(event: string, handler: (e: unknown) => void) {
    listeners[event] = listeners[event] || [];
    listeners[event].push(handler);
  },
  removeEventListener(event: string, handler: (e: unknown) => void) {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter((h) => h !== handler);
    }
  },
};

(globalThis as unknown as { window: typeof mockWindow }).window = mockWindow;
(globalThis as unknown as { CustomEvent: unknown }).CustomEvent = class CustomEvent {
  type: string;
  detail: unknown;
  constructor(type: string, opts?: { detail?: unknown }) {
    this.type = type;
    this.detail = opts?.detail;
  }
};

if (typeof process !== 'undefined') {
  process.env.VITE_GTM_ID = 'GTM-TEST123';
}

// Importa módulo após mocks instalados
import {
  setupDefaultConsentMode,
  initAnalyticsIfConsented,
  getStoredConsent,
  getCookiePreferences,
  saveCookiePreferences,
  isAnalyticsAllowed,
  isMarketingAllowed,
  isValidGtmId,
  getGtmId,
  trackEvent,
  trackWhatsAppConversion,
  trackPhoneConversion,
  trackLeadSubmission,
  sanitizeEventParams,
  BEHAVIORAL_EVENTS,
  CONVERSION_EVENTS,
  CONSENT_STORAGE_KEY,
  PREFERENCES_STORAGE_KEY,
} from '../src/utils/analytics.js';

describe('Google Consent Mode v2 & GTM Single Tag Owner Suite', () => {
  beforeEach(() => {
    mockStorage.clear();
    mockHead.children = [];
    mockWindow.dataLayer = [];
    delete (mockWindow as Record<string, unknown>).gtag;
    if (typeof process !== 'undefined') {
      process.env.VITE_GTM_ID = 'GTM-TEST123';
    }
  });

  it('1. Default Consent Mode v2 values are pushed to dataLayer with all denied before consent choice', () => {
    setupDefaultConsentMode();

    assert.ok(Array.isArray(mockWindow.dataLayer), 'dataLayer should exist');
    assert.strictEqual(mockWindow.dataLayer.length, 1, 'Should have 1 default consent call');

    const callArgs = mockWindow.dataLayer[0] as unknown[];
    assert.strictEqual(callArgs[0], 'consent');
    assert.strictEqual(callArgs[1], 'default');

    const config = callArgs[2] as Record<string, unknown>;
    assert.strictEqual(config.analytics_storage, 'denied');
    assert.strictEqual(config.ad_storage, 'denied');
    assert.strictEqual(config.ad_user_data, 'denied');
    assert.strictEqual(config.ad_personalization, 'denied');
    assert.strictEqual(config.wait_for_update, 500);
  });

  it('2. GTM script is NOT injected before user makes an explicit consent choice', () => {
    // Estado inicial: pending
    assert.strictEqual(getStoredConsent(), 'pending');
    initAnalyticsIfConsented();

    assert.strictEqual(
      mockDocument.getElementById('gtm-script'),
      null,
      'GTM script must not be injected while consent is pending'
    );
  });

  it('3. Rejecting optional cookies blocks GTM script injection and tracking events', () => {
    saveCookiePreferences({ analytics: false, marketing: false });

    assert.strictEqual(getStoredConsent(), 'denied');
    initAnalyticsIfConsented();

    assert.strictEqual(
      mockDocument.getElementById('gtm-script'),
      null,
      'GTM script must not be injected when user rejects optional cookies'
    );

    // Tentativa de envio de evento deve ser suprimida
    const beforeLength = (mockWindow.dataLayer as unknown[]).length;
    trackWhatsAppConversion('header');
    const afterLength = (mockWindow.dataLayer as unknown[]).length;

    assert.strictEqual(beforeLength, afterLength, 'No event should be pushed when consent is denied');
  });

  it('4. Marketing-only consent sets ad_storage granted and analytics_storage denied', () => {
    saveCookiePreferences({ analytics: false, marketing: true });

    const prefs = getCookiePreferences();
    assert.strictEqual(prefs.marketing, true);
    assert.strictEqual(prefs.analytics, false);
    assert.strictEqual(getStoredConsent(), 'granted');

    // Verifica chamada de consent update
    const lastCall = mockWindow.dataLayer[mockWindow.dataLayer.length - 1] as unknown[];
    assert.strictEqual(lastCall[0], 'consent');
    assert.strictEqual(lastCall[1], 'update');

    const payload = lastCall[2] as Record<string, string>;
    assert.strictEqual(payload.ad_storage, 'granted');
    assert.strictEqual(payload.ad_user_data, 'granted');
    assert.strictEqual(payload.ad_personalization, 'granted');
    assert.strictEqual(payload.analytics_storage, 'denied');

    // GTM deve ser injetado pois uma categoria opcional relevante (marketing) foi aceita
    initAnalyticsIfConsented();
    assert.ok(mockDocument.getElementById('gtm-script') !== null, 'GTM injected for marketing tags');
  });

  it('5. Analytics-only consent sets analytics_storage granted and ad_storage denied', () => {
    saveCookiePreferences({ analytics: true, marketing: false });

    const prefs = getCookiePreferences();
    assert.strictEqual(prefs.analytics, true);
    assert.strictEqual(prefs.marketing, false);
    assert.strictEqual(getStoredConsent(), 'granted');

    const lastCall = mockWindow.dataLayer[mockWindow.dataLayer.length - 1] as unknown[];
    assert.strictEqual(lastCall[0], 'consent');
    assert.strictEqual(lastCall[1], 'update');

    const payload = lastCall[2] as Record<string, string>;
    assert.strictEqual(payload.analytics_storage, 'granted');
    assert.strictEqual(payload.ad_storage, 'denied');
    assert.strictEqual(payload.ad_user_data, 'denied');
    assert.strictEqual(payload.ad_personalization, 'denied');

    // GTM deve ser injetado para carregar GA4
    initAnalyticsIfConsented();
    assert.ok(mockDocument.getElementById('gtm-script') !== null, 'GTM injected for analytics tags');
  });

  it('6. Revocation updates Consent Mode to denied and prevents subsequent dataLayer tracking events', () => {
    // 1. Concede ambos
    saveCookiePreferences({ analytics: true, marketing: true });
    assert.strictEqual(getStoredConsent(), 'granted');

    trackWhatsAppConversion('hero');
    const heroEvent = (mockWindow.dataLayer as Record<string, unknown>[]).find(
      (item) => item.event === 'whatsapp_click' && item.section === 'hero'
    );
    assert.ok(heroEvent, 'WhatsApp click event was delivered while granted');

    // 2. Revoga
    saveCookiePreferences({ analytics: false, marketing: false });
    assert.strictEqual(getStoredConsent(), 'denied');

    // Checa update no Consent Mode
    const lastCall = mockWindow.dataLayer[mockWindow.dataLayer.length - 1] as unknown[];
    assert.strictEqual(lastCall[0], 'consent');
    assert.strictEqual(lastCall[1], 'update');
    const updatePayload = lastCall[2] as Record<string, string>;
    assert.strictEqual(updatePayload.analytics_storage, 'denied');
    assert.strictEqual(updatePayload.ad_storage, 'denied');

    // 3. Tenta disparar novo evento após revogação
    trackWhatsAppConversion('footer');
    const footerEvent = (mockWindow.dataLayer as Record<string, unknown>[]).find(
      (item) => item.event === 'whatsapp_click' && item.section === 'footer'
    );
    assert.strictEqual(footerEvent, undefined, 'Footer WhatsApp event must NOT be dispatched after revocation');
  });

  it('7. chat_widget_toggle does NOT fire whatsapp_click conversion event', () => {
    saveCookiePreferences({ analytics: true, marketing: true });

    // Dispara toggle de abertura do chat flutuante
    trackEvent('chat_widget_toggle', { section: 'floating-button', action: 'open' });

    const toggleEvent = (mockWindow.dataLayer as Record<string, unknown>[]).find(
      (item) => item.event === 'chat_widget_toggle'
    );
    assert.ok(toggleEvent, 'chat_widget_toggle event should exist');
    assert.strictEqual(toggleEvent.section, 'floating-button');
    assert.strictEqual(toggleEvent.action, 'open');

    const whatsappConversion = (mockWindow.dataLayer as Record<string, unknown>[]).find(
      (item) => item.event === 'whatsapp_click'
    );
    assert.strictEqual(
      whatsappConversion,
      undefined,
      'Opening chat widget must never trigger whatsapp_click conversion'
    );
  });

  it('8. Outbound WhatsApp action emits whatsapp_click exactly once with safe parameters', () => {
    saveCookiePreferences({ analytics: true, marketing: true });

    const initialCount = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (i) => i.event === 'whatsapp_click'
    ).length;

    trackWhatsAppConversion('floating-chat-send', { has_custom_message: true });

    const finalEvents = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (i) => i.event === 'whatsapp_click'
    );
    assert.strictEqual(finalEvents.length, initialCount + 1, 'whatsapp_click must be emitted exactly once');

    const event = finalEvents[finalEvents.length - 1];
    assert.strictEqual(event.section, 'floating-chat-send');
    assert.strictEqual(event.channel, 'whatsapp');
    assert.strictEqual(event.has_custom_message, true);
    assert.ok(typeof event.timestamp === 'string', 'Timestamp should be included');
  });

  it('9. PII parameters (phone, name, email, plate, message, notes) are stripped by sanitizeEventParams', () => {
    const rawParams = {
      section: 'quote-form',
      channel: 'whatsapp',
      name: 'João da Silva',
      Nome: 'João da Silva',
      phone: '11999999999',
      telefone: '11999999999',
      whatsapp: '11999999999',
      email: 'joao@exemplo.com.br',
      cpf: '123.456.789-00',
      placa: 'ABC1D23',
      plate: 'ABC1D23',
      message: 'Olá, gostaria de saber o valor para pintar o para-choque',
      mensagem: 'Olá, texto confidencial',
      notes: 'Carro batido na lateral',
      observacoes: 'Dano na porta',
      valid_metric_count: 3,
      is_insurance: true,
    };

    const sanitized = sanitizeEventParams(rawParams);

    // Garante que campos seguros persistem
    assert.strictEqual(sanitized.section, 'quote-form');
    assert.strictEqual(sanitized.channel, 'whatsapp');
    assert.strictEqual(sanitized.valid_metric_count, 3);
    assert.strictEqual(sanitized.is_insurance, true);

    // Garante que nenhum PII sobreviveu
    const keys = Object.keys(sanitized).map((k) => k.toLowerCase());
    assert.strictEqual(keys.includes('name'), false);
    assert.strictEqual(keys.includes('nome'), false);
    assert.strictEqual(keys.includes('phone'), false);
    assert.strictEqual(keys.includes('telefone'), false);
    assert.strictEqual(keys.includes('whatsapp'), false);
    assert.strictEqual(keys.includes('email'), false);
    assert.strictEqual(keys.includes('cpf'), false);
    assert.strictEqual(keys.includes('placa'), false);
    assert.strictEqual(keys.includes('plate'), false);
    assert.strictEqual(keys.includes('message'), false);
    assert.strictEqual(keys.includes('mensagem'), false);
    assert.strictEqual(keys.includes('notes'), false);
    assert.strictEqual(keys.includes('observacoes'), false);
  });

  it('10. trackLeadSubmission emits generate_lead with only non-PII operational fields and is separate from whatsapp_click', () => {
    saveCookiePreferences({ analytics: true, marketing: false });

    trackLeadSubmission({
      service: 'Pintura na Estufa',
      isInsurance: 'Sim',
      hasYear: true,
      partsCount: 2,
      hasNotes: true,
    });

    const leadEvents = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.event === 'generate_lead'
    );
    assert.strictEqual(leadEvents.length, 1, 'generate_lead must be emitted exactly once');

    const lead = leadEvents[0];
    assert.strictEqual(lead.conversion_type, 'quote_form');
    assert.strictEqual(lead.lead_intent, 'whatsapp_quote_request');
    assert.strictEqual(lead.service_type, 'Pintura na Estufa');
    assert.strictEqual(lead.is_insurance, 'Sim');
    assert.strictEqual(lead.has_vehicle_year, true);
    assert.strictEqual(lead.damaged_parts_count, 2);
    assert.strictEqual(lead.has_damage_notes, true);

    // Confirma que não foram gerados campos identificáveis
    assert.strictEqual(lead.name, undefined);
    assert.strictEqual(lead.phone, undefined);
    assert.strictEqual(lead.placa, undefined);
    assert.strictEqual(lead.message, undefined);

    // Confirma que não disparou whatsapp_click junto
    const whatsappClicks = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.event === 'whatsapp_click'
    );
    assert.strictEqual(whatsappClicks.length, 0, 'Quote form lead submission must not trigger whatsapp_click');
  });

  it('11. trackPhoneConversion emits phone_click when consented and is suppressed when revoked', () => {
    saveCookiePreferences({ analytics: true, marketing: true });

    trackPhoneConversion('footer');

    const phoneEvents = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.event === 'phone_click'
    );
    assert.strictEqual(phoneEvents.length, 1);
    assert.strictEqual(phoneEvents[0].section, 'footer');
    assert.strictEqual(phoneEvents[0].channel, 'telephone');

    // Revoga
    saveCookiePreferences({ analytics: false, marketing: false });
    trackPhoneConversion('footer');

    const phoneEventsAfter = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.event === 'phone_click'
    );
    assert.strictEqual(phoneEventsAfter.length, 1, 'phone_click must not be dispatched after revocation');
  });

  it('12. End-to-end consent lifecycle: pending -> partial consent -> tracking allowed -> revocation -> all tracking blocked', () => {
    // Fase 1: Visitante entra no site, consentimento pendente
    setupDefaultConsentMode();
    assert.strictEqual(getStoredConsent(), 'pending');

    // Nenhuma tag injetada, eventos bloqueados
    initAnalyticsIfConsented();
    assert.strictEqual(mockDocument.getElementById('gtm-script'), null);
    trackWhatsAppConversion('hero');
    const heroEventsInitial = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.event === 'whatsapp_click'
    );
    assert.strictEqual(heroEventsInitial.length, 0, 'No event while pending');

    // Fase 2: Visitante aceita apenas Cookies Analíticos (GA4)
    saveCookiePreferences({ analytics: true, marketing: false });
    assert.strictEqual(getStoredConsent(), 'granted');
    initAnalyticsIfConsented();
    assert.ok(mockDocument.getElementById('gtm-script') !== null, 'GTM script injected for GA4');

    // Evento disparado com sucesso no dataLayer
    trackWhatsAppConversion('hero');
    const heroEventsAllowed = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.event === 'whatsapp_click'
    );
    assert.strictEqual(heroEventsAllowed.length, 1, 'Event dispatched after consent');

    // Fase 3: Visitante abre modal de privacidade e revoga todos os cookies opcionais
    saveCookiePreferences({ analytics: false, marketing: false });
    assert.strictEqual(getStoredConsent(), 'denied');

    // Verifica que Consent Mode v2 foi atualizado para denied
    const lastConsentUpdate = mockWindow.dataLayer[mockWindow.dataLayer.length - 1] as unknown[];
    assert.strictEqual(lastConsentUpdate[0], 'consent');
    assert.strictEqual(lastConsentUpdate[1], 'update');
    const updatePayload = lastConsentUpdate[2] as Record<string, string>;
    assert.strictEqual(updatePayload.analytics_storage, 'denied');
    assert.strictEqual(updatePayload.ad_storage, 'denied');
    assert.strictEqual(updatePayload.ad_user_data, 'denied');
    assert.strictEqual(updatePayload.ad_personalization, 'denied');

    // Fase 4: Novas interações são 100% bloqueadas na camada de código
    trackLeadSubmission({
      service: 'Funilaria',
      isInsurance: 'Não',
      hasYear: false,
      partsCount: 1,
      hasNotes: false,
    });
    trackWhatsAppConversion('header');

    const leadEventsBlocked = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.event === 'generate_lead'
    );
    const headerEventsBlocked = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.event === 'whatsapp_click' && item.section === 'header'
    );
    assert.strictEqual(leadEventsBlocked.length, 0, 'generate_lead must be blocked post-revocation');
    assert.strictEqual(headerEventsBlocked.length, 0, 'whatsapp_click must be blocked post-revocation');
  });

  it('13. getCookiePreferences: empty localStorage, invalid JSON, JSON null, array, and empty object all deny optional categories', () => {
    // 1. localStorage vazio
    mockStorage.clear();
    assert.deepStrictEqual(getCookiePreferences(), {
      necessary: true,
      analytics: false,
      marketing: false,
    });

    // 2. JSON inválido
    mockStorage.setItem(PREFERENCES_STORAGE_KEY, '{invalid-json');
    assert.deepStrictEqual(getCookiePreferences(), {
      necessary: true,
      analytics: false,
      marketing: false,
    });

    // 3. JSON null
    mockStorage.setItem(PREFERENCES_STORAGE_KEY, 'null');
    assert.deepStrictEqual(getCookiePreferences(), {
      necessary: true,
      analytics: false,
      marketing: false,
    });

    // 4. JSON array
    mockStorage.setItem(PREFERENCES_STORAGE_KEY, '["analytics","marketing"]');
    assert.deepStrictEqual(getCookiePreferences(), {
      necessary: true,
      analytics: false,
      marketing: false,
    });

    // 5. Objeto vazio
    mockStorage.setItem(PREFERENCES_STORAGE_KEY, '{}');
    assert.deepStrictEqual(getCookiePreferences(), {
      necessary: true,
      analytics: false,
      marketing: false,
      updatedAt: undefined,
    });
  });

  it('14. getCookiePreferences: strings "false" and "true", numbers, and non-booleans never grant permissions; only strict boolean true is accepted', () => {
    // Strings "false" e "true"
    mockStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ necessary: true, analytics: 'false', marketing: 'true' })
    );
    assert.deepStrictEqual(getCookiePreferences(), {
      necessary: true,
      analytics: false,
      marketing: false,
      updatedAt: undefined,
    });

    // Números 1 e 0
    mockStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ necessary: true, analytics: 1, marketing: 0 })
    );
    assert.deepStrictEqual(getCookiePreferences(), {
      necessary: true,
      analytics: false,
      marketing: false,
      updatedAt: undefined,
    });

    // Valores booleanos verdadeiros e falsos
    mockStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ necessary: false, analytics: true, marketing: false, updatedAt: '2026-10-30T00:00:00.000Z' })
    );
    assert.deepStrictEqual(getCookiePreferences(), {
      necessary: true,
      analytics: true,
      marketing: false,
      updatedAt: '2026-10-30T00:00:00.000Z',
    });

    mockStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ necessary: true, analytics: false, marketing: true })
    );
    assert.deepStrictEqual(getCookiePreferences(), {
      necessary: true,
      analytics: false,
      marketing: true,
      updatedAt: undefined,
    });
  });

  it('15. Legacy key gm_cookie_consent_v1 = granted never elevates permissions when v2 is missing or corrupted', () => {
    // Registro legado isolado (v2 ausente)
    mockStorage.clear();
    mockStorage.setItem(CONSENT_STORAGE_KEY, 'granted');

    assert.deepStrictEqual(getCookiePreferences(), {
      necessary: true,
      analytics: false,
      marketing: false,
    });
    assert.strictEqual(getStoredConsent(), 'denied');
    assert.strictEqual(isAnalyticsAllowed(), false);
    assert.strictEqual(isMarketingAllowed(), false);

    // Registro legado concedido com preferências granulares corrompidas
    mockStorage.setItem(PREFERENCES_STORAGE_KEY, '{corrupted_json');
    assert.deepStrictEqual(getCookiePreferences(), {
      necessary: true,
      analytics: false,
      marketing: false,
    });
    assert.strictEqual(getStoredConsent(), 'denied');
    assert.strictEqual(isAnalyticsAllowed(), false);
    assert.strictEqual(isMarketingAllowed(), false);

    // Garante que dados existentes no localStorage não foram apagados arbitrariamente
    assert.strictEqual(mockStorage.getItem(CONSENT_STORAGE_KEY), 'granted');
    assert.strictEqual(mockStorage.getItem(PREFERENCES_STORAGE_KEY), '{corrupted_json');
  });

  it('16. Behavioral events require Analytics consent and are blocked when only Marketing is granted', () => {
    const behavioralEventNames = Array.from(BEHAVIORAL_EVENTS);
    assert.strictEqual(behavioralEventNames.length, 6);

    // Cenário A: Apenas Marketing autorizado (analytics: false, marketing: true)
    saveCookiePreferences({ analytics: false, marketing: true });
    assert.strictEqual(isAnalyticsAllowed(), false);
    assert.strictEqual(isMarketingAllowed(), true);

    for (const evt of behavioralEventNames) {
      trackEvent(evt, { section: 'test-section' });
    }

    const dispatchedWhileMarketingOnly = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => typeof item.event === 'string' && BEHAVIORAL_EVENTS.has(item.event)
    );
    assert.strictEqual(
      dispatchedWhileMarketingOnly.length,
      0,
      'Behavioral events must NOT be sent when only Marketing is granted'
    );

    // Cenário B: Apenas Analytics autorizado (analytics: true, marketing: false)
    saveCookiePreferences({ analytics: true, marketing: false });
    assert.strictEqual(isAnalyticsAllowed(), true);
    assert.strictEqual(isMarketingAllowed(), false);

    for (const evt of behavioralEventNames) {
      trackEvent(evt, { section: 'test-section' });
    }

    const dispatchedWhileAnalytics = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => typeof item.event === 'string' && BEHAVIORAL_EVENTS.has(item.event)
    );
    assert.strictEqual(
      dispatchedWhileAnalytics.length,
      behavioralEventNames.length,
      'All behavioral events must be sent when Analytics is granted'
    );
  });

  it('17. Conversion events are allowed with Analytics-only, Marketing-only, or full consent, and blocked when denied', () => {
    const conversionEventNames = Array.from(CONVERSION_EVENTS);
    assert.strictEqual(conversionEventNames.length, 3);

    // 1. Apenas Marketing
    saveCookiePreferences({ analytics: false, marketing: true });
    for (const evt of conversionEventNames) {
      trackEvent(evt, { section: 'mkt-only' });
    }
    const mktEvents = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.section === 'mkt-only'
    );
    assert.strictEqual(mktEvents.length, 3, 'Conversions must be pushed when Marketing is allowed');

    // 2. Apenas Analytics
    saveCookiePreferences({ analytics: true, marketing: false });
    for (const evt of conversionEventNames) {
      trackEvent(evt, { section: 'ana-only' });
    }
    const anaEvents = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.section === 'ana-only'
    );
    assert.strictEqual(anaEvents.length, 3, 'Conversions must be pushed when Analytics is allowed');

    // 3. Consentimento completo
    saveCookiePreferences({ analytics: true, marketing: true });
    for (const evt of conversionEventNames) {
      trackEvent(evt, { section: 'both-allowed' });
    }
    const bothEvents = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.section === 'both-allowed'
    );
    assert.strictEqual(bothEvents.length, 3, 'Conversions must be pushed when both categories are allowed');

    // 4. Ambos negados
    saveCookiePreferences({ analytics: false, marketing: false });
    for (const evt of conversionEventNames) {
      trackEvent(evt, { section: 'none-allowed' });
    }
    const noneEvents = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.section === 'none-allowed'
    );
    assert.strictEqual(noneEvents.length, 0, 'Conversions must be blocked when both categories are denied');
  });

  it('18. Unknown events are strictly blocked even with full consent', () => {
    saveCookiePreferences({ analytics: true, marketing: true });

    const beforeCount = (mockWindow.dataLayer as unknown[]).length;
    trackEvent('unknown_custom_event', { section: 'hero' });
    trackEvent('arbitrary_injection', { action: 'click' });
    const afterCount = (mockWindow.dataLayer as unknown[]).length;

    assert.strictEqual(afterCount, beforeCount, 'Unknown events must never be pushed to dataLayer');
  });

  it('19. GTM ID validation trims whitespace, accepts valid GTM-XXXX IDs, and rejects malformed IDs', () => {
    assert.strictEqual(isValidGtmId('GTM-ABC1234'), true);
    assert.strictEqual(isValidGtmId('  gtm-99xyz  '), true);
    assert.strictEqual(isValidGtmId(''), false);
    assert.strictEqual(isValidGtmId('   '), false);
    assert.strictEqual(isValidGtmId('G-12345678'), false);
    assert.strictEqual(isValidGtmId('AW-123456'), false);
    assert.strictEqual(isValidGtmId('GTM-'), false);
    assert.strictEqual(isValidGtmId("GTM-123');alert(1)//"), false);
    assert.strictEqual(isValidGtmId(null), false);
    assert.strictEqual(isValidGtmId(undefined), false);

    // Testa getGtmId() com trim e rejeição de ID malformado
    process.env.VITE_GTM_ID = '  GTM-VALID99  ';
    assert.strictEqual(getGtmId(), 'GTM-VALID99');

    process.env.VITE_GTM_ID = "GTM-BAD');alert(1);//";
    assert.strictEqual(getGtmId(), undefined);

    saveCookiePreferences({ analytics: true, marketing: true });
    initAnalyticsIfConsented();
    assert.strictEqual(
      mockDocument.getElementById('gtm-script'),
      null,
      'Malformed GTM ID must never inject a script element'
    );
  });

  it('20. GTM script uses external script.src without script.innerHTML and prevents duplicate container injection', () => {
    process.env.VITE_GTM_ID = '  GTM-SAFE777  ';
    saveCookiePreferences({ analytics: true, marketing: true });

    initAnalyticsIfConsented();
    initAnalyticsIfConsented(); // Segunda chamada deve ser ignorada para injeção do script

    const gtmScripts = mockHead.children.filter((el) => el.id === 'gtm-script');
    assert.strictEqual(gtmScripts.length, 1, 'GTM container script must be injected at most once');

    const script = gtmScripts[0];
    assert.strictEqual(script.async, true);
    assert.strictEqual(script.src, 'https://www.googletagmanager.com/gtm.js?id=GTM-SAFE777');
    assert.strictEqual(script.innerHTML, '', 'script.innerHTML must not be used');

    const gtmStartEvents = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item && typeof item === 'object' && item.event === 'gtm.js' && typeof item['gtm.start'] === 'number'
    );
    assert.strictEqual(gtmStartEvents.length, 1, 'gtm.js initialization event must be pushed once to dataLayer');
  });

  it('21. setupDefaultConsentMode is idempotent and does not push duplicate consent default entries', () => {
    setupDefaultConsentMode();
    setupDefaultConsentMode();
    setupDefaultConsentMode();

    const defaultCalls = (mockWindow.dataLayer as unknown[]).filter((entry) => {
      if (!entry || typeof entry !== 'object') return false;
      const args = entry as ArrayLike<unknown>;
      return args[0] === 'consent' && args[1] === 'default';
    });

    assert.strictEqual(defaultCalls.length, 1, 'consent default must only be pushed once per initialization');

    // Confirma que atualizações posteriores de consentimento continuam funcionando normalmente
    saveCookiePreferences({ analytics: true, marketing: false });
    const updateCalls = (mockWindow.dataLayer as unknown[]).filter((entry) => {
      if (!entry || typeof entry !== 'object') return false;
      const args = entry as ArrayLike<unknown>;
      return args[0] === 'consent' && args[1] === 'update';
    });
    assert.strictEqual(updateCalls.length, 1, 'subsequent consent update must still be recorded');
  });

  it('22. Partial consent downgrade (Analytics + Marketing -> Marketing only) immediately blocks behavioral events while keeping conversions allowed', () => {
    // 1. Concede consentimento completo
    saveCookiePreferences({ analytics: true, marketing: true });
    assert.strictEqual(isAnalyticsAllowed(), true);
    assert.strictEqual(isMarketingAllowed(), true);

    trackEvent('gallery_open', { section: 'before-downgrade' });
    trackWhatsAppConversion('before-downgrade');

    const galleryBefore = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.event === 'gallery_open' && item.section === 'before-downgrade'
    );
    const whatsappBefore = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.event === 'whatsapp_click' && item.section === 'before-downgrade'
    );
    assert.strictEqual(galleryBefore.length, 1);
    assert.strictEqual(whatsappBefore.length, 1);

    // 2. Rebaixa para somente Marketing
    saveCookiePreferences({ analytics: false, marketing: true });
    assert.strictEqual(isAnalyticsAllowed(), false);
    assert.strictEqual(isMarketingAllowed(), true);

    const lastConsentUpdate = mockWindow.dataLayer[mockWindow.dataLayer.length - 1] as unknown[];
    assert.strictEqual(lastConsentUpdate[0], 'consent');
    assert.strictEqual(lastConsentUpdate[1], 'update');
    const updatePayload = lastConsentUpdate[2] as Record<string, string>;
    assert.strictEqual(updatePayload.analytics_storage, 'denied');
    assert.strictEqual(updatePayload.ad_storage, 'granted');
    assert.strictEqual(updatePayload.ad_user_data, 'granted');
    assert.strictEqual(updatePayload.ad_personalization, 'granted');

    // 3. Eventos comportamentais agora são bloqueados, mas conversões continuam permitidas
    trackEvent('gallery_open', { section: 'after-downgrade' });
    trackWhatsAppConversion('after-downgrade');

    const galleryAfter = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.event === 'gallery_open' && item.section === 'after-downgrade'
    );
    const whatsappAfter = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.event === 'whatsapp_click' && item.section === 'after-downgrade'
    );
    assert.strictEqual(galleryAfter.length, 0, 'Behavioral event must be blocked after Analytics downgrade');
    assert.strictEqual(whatsappAfter.length, 1, 'Conversion event must remain allowed under Marketing consent');
  });

  it('23. Page reload simulation with previously saved preferences initializes setupDefaultConsentMode with exact stored categories', () => {
    // Visitante salva apenas Analytics e recarrega a página
    saveCookiePreferences({ analytics: true, marketing: false });

    // Simula reload do navegador (dataLayer e DOM limpos, mas localStorage mantido)
    mockWindow.dataLayer = [];
    mockHead.children = [];
    delete (mockWindow as Record<string, unknown>).gtag;

    setupDefaultConsentMode();

    assert.strictEqual(mockWindow.dataLayer.length, 1);
    const defaultCall = mockWindow.dataLayer[0] as unknown[];
    assert.strictEqual(defaultCall[0], 'consent');
    assert.strictEqual(defaultCall[1], 'default');
    const defaultConfig = defaultCall[2] as Record<string, unknown>;
    assert.strictEqual(defaultConfig.analytics_storage, 'granted');
    assert.strictEqual(defaultConfig.ad_storage, 'denied');
    assert.strictEqual(defaultConfig.ad_user_data, 'denied');
    assert.strictEqual(defaultConfig.ad_personalization, 'denied');
  });

  it('24. sanitizeEventParams truncates strings longer than 100 chars and strips nested objects, arrays, and functions', () => {
    const longString = 'A'.repeat(160);
    const sanitized = sanitizeEventParams({
      long_label: longString,
      short_label: 'Pintura Automotiva',
      nested_obj: { secret: 'value' },
      nested_arr: ['a', 'b', 'c'],
      fn_param: () => 'noop',
      undef_param: undefined,
      null_param: null,
      count: 4,
      active: true,
    });

    assert.strictEqual(typeof sanitized.long_label, 'string');
    assert.strictEqual((sanitized.long_label as string).length, 100);
    assert.strictEqual(sanitized.long_label, 'A'.repeat(100));
    assert.strictEqual(sanitized.short_label, 'Pintura Automotiva');
    assert.strictEqual(sanitized.count, 4);
    assert.strictEqual(sanitized.active, true);
    assert.strictEqual('nested_obj' in sanitized, false);
    assert.strictEqual('nested_arr' in sanitized, false);
    assert.strictEqual('fn_param' in sanitized, false);
    assert.strictEqual('undef_param' in sanitized, false);
    assert.strictEqual('null_param' in sanitized, false);
  });

  it('25. localStorage unavailability or exceptions are handled gracefully with restrictive fallback', () => {
    const throwingStorage = {
      getItem(): string | null {
        throw new Error('SecurityError: localStorage disabled');
      },
      setItem(): void {
        throw new Error('QuotaExceededError');
      },
      removeItem(): void {
        throw new Error('SecurityError');
      },
      clear(): void {
        throw new Error('SecurityError');
      },
    };

    (globalThis as unknown as { localStorage: typeof throwingStorage }).localStorage = throwingStorage;

    try {
      assert.doesNotThrow(() => {
        const prefs = getCookiePreferences();
        assert.deepStrictEqual(prefs, {
          necessary: true,
          analytics: false,
          marketing: false,
        });
        assert.strictEqual(getStoredConsent(), 'pending');
        assert.strictEqual(isAnalyticsAllowed(), false);
        assert.strictEqual(isMarketingAllowed(), false);

        saveCookiePreferences({ analytics: true, marketing: true });
        trackWhatsAppConversion('hero');
      });

      // Como o armazenamento falhou ao persistir, o status permanece restritivo ('pending') e nenhum evento de tracking é enviado
      const events = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
        (item) => item && typeof item === 'object' && item.event === 'whatsapp_click'
      );
      assert.strictEqual(events.length, 0, 'Tracking events must remain blocked when storage fails');
    } finally {
      (globalThis as unknown as { localStorage: MockLocalStorage }).localStorage = mockStorage;
    }
  });

  it('26. All 9 official event identifiers are preserved without renaming or translation', () => {
    const expectedBehavioral = [
      'gallery_open',
      'testimonial_spin',
      'slider_interact',
      'maps_click',
      'simulator_use',
      'chat_widget_toggle',
    ];
    const expectedConversions = [
      'whatsapp_click',
      'generate_lead',
      'phone_click',
    ];

    assert.deepStrictEqual(Array.from(BEHAVIORAL_EVENTS).sort(), expectedBehavioral.slice().sort());
    assert.deepStrictEqual(Array.from(CONVERSION_EVENTS).sort(), expectedConversions.slice().sort());
  });

  it('27. BeforeAfterSlider CTA uses standardized trackWhatsAppConversion("before-after-cta") with channel: "whatsapp"', () => {
    const sliderSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/BeforeAfterSlider.tsx'),
      'utf8'
    );

    assert.ok(
      sliderSource.includes("trackWhatsAppConversion('before-after-cta')"),
      'BeforeAfterSlider must call trackWhatsAppConversion("before-after-cta")'
    );
    assert.strictEqual(
      sliderSource.includes("trackEvent('whatsapp_click'"),
      false,
      'BeforeAfterSlider must not bypass trackWhatsAppConversion with direct trackEvent("whatsapp_click")'
    );

    saveCookiePreferences({ analytics: true, marketing: true });
    trackWhatsAppConversion('before-after-cta');

    const events = (mockWindow.dataLayer as Record<string, unknown>[]).filter(
      (item) => item.event === 'whatsapp_click' && item.section === 'before-after-cta'
    );
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].channel, 'whatsapp');
  });

  it('28. QuoteForm removes visitor phone collection and Location requires explicit click to load Google Maps iframe', () => {
    const quoteFormSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/QuoteForm.tsx'),
      'utf8'
    );
    assert.strictEqual(quoteFormSource.includes('form-phone'), false, 'QuoteForm must not render #form-phone input');
    assert.strictEqual(quoteFormSource.includes('formatPhone'), false, 'QuoteForm must not contain formatPhone helper');
    assert.strictEqual(quoteFormSource.includes('handlePhoneChange'), false, 'QuoteForm must not contain handlePhoneChange');
    assert.strictEqual(quoteFormSource.includes('WhatsApp com DDD'), false, 'QuoteForm must not ask for visitor WhatsApp number');

    const locationSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/Location.tsx'),
      'utf8'
    );
    assert.strictEqual(
      locationSource.includes('IntersectionObserver'),
      false,
      'Location must not auto-load Google Maps via IntersectionObserver'
    );
    assert.ok(
      locationSource.includes('Carregar mapa interativo'),
      'Location must provide explicit "Carregar mapa interativo" button'
    );
    assert.ok(
      locationSource.includes('Abrir no Google Maps'),
      'Location must provide separate "Abrir no Google Maps" external link'
    );
    assert.ok(
      locationSource.includes('businessData.social.googleMaps'),
      'Location must use official businessData.social.googleMaps URL'
    );

    const privacySource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/PrivacyModal.tsx'),
      'utf8'
    );
    assert.strictEqual(
      privacySource.includes('Meta Ads'),
      false,
      'PrivacyModal must not mention Meta Ads'
    );
    assert.strictEqual(
      privacySource.includes('Meta Pixel'),
      false,
      'PrivacyModal must not mention Meta Pixel'
    );
    assert.ok(
      privacySource.includes('O formulário do site não coleta seu número de telefone'),
      'PrivacyModal must explicitly state that the website form does not collect the visitor phone number'
    );
  });
});



