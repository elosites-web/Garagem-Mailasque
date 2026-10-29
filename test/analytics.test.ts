import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

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
  trackEvent,
  trackWhatsAppConversion,
  trackPhoneConversion,
  trackLeadSubmission,
  sanitizeEventParams,
  CONSENT_STORAGE_KEY,
  PREFERENCES_STORAGE_KEY,
} from '../src/utils/analytics.js';

describe('Google Consent Mode v2 & GTM Single Tag Owner Suite', () => {
  beforeEach(() => {
    mockStorage.clear();
    mockHead.children = [];
    mockWindow.dataLayer = [];
    delete (mockWindow as Record<string, unknown>).gtag;
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
});

