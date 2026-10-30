import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  businessData,
  WHATSAPP_EMOJIS,
  WHATSAPP_TEMPLATES,
} from '../src/data/business';
import { WHATSAPP_EMOJIS as DIRECT_WHATSAPP_EMOJIS } from '../src/utils/whatsappEmojis';
import { services } from '../src/data/services';
import { trackWhatsAppConversion, trackLeadSubmission, sanitizeEventParams } from '../src/utils/analytics';

/**
 * Extrai e decodifica o parametro 'text' usando a API padrao URL / URLSearchParams.
 */
function getDecodedText(whatsappUrl: string): string {
  const urlObj = new URL(whatsappUrl);
  return urlObj.searchParams.get('text') || '';
}

/**
 * Valida rigorosamente qualquer mensagem original e sua respectiva URL do WhatsApp:
 * - Ausencia de U+FFFD tanto na mensagem original quanto na decodificada
 * - Ausencia de %EF%BF%BD na URL codificada
 * - Comparacao round-trip (originalMessage === decodedMessage)
 * - Presenca dos emojis reais via String.fromCodePoint(...)
 * - Preservacao de quebras de linha, negrito (*...*) e acentuacao em portugues
 */
function assertValidWhatsAppOutput(params: {
  label: string;
  originalMessage: string;
  url: string;
  expectedEmojiCodePoints: number[];
  expectedAccentedWords: string[];
  expectedBoldSegments: string[];
  minLines?: number;
}) {
  const {
    label,
    originalMessage,
    url,
    expectedEmojiCodePoints,
    expectedAccentedWords,
    expectedBoldSegments,
    minLines = 5,
  } = params;

  const decodedMessage = getDecodedText(url);

  // 1. Nenhuma das strings pode conter U+FFFD
  assert.equal(originalMessage.includes('\uFFFD'), false, `[${label}] Original message must not contain U+FFFD`);
  assert.equal(decodedMessage.includes('\uFFFD'), false, `[${label}] Decoded message must not contain U+FFFD`);
  assert.equal(url.includes('\uFFFD'), false, `[${label}] URL must not contain U+FFFD`);
  assert.equal(url.includes('%EF%BF%BD'), false, `[${label}] Encoded URL must not contain %EF%BF%BD`);
  assert.equal(url.includes('%25'), false, `[${label}] URL must not contain double-encoded sequences (%25)`);

  // 2. Round-trip exato
  assert.equal(originalMessage, decodedMessage, `[${label}] Round-trip originalMessage must equal decodedMessage`);

  // 3. Verificacao explicita de cada emoji via String.fromCodePoint()
  for (const cp of expectedEmojiCodePoints) {
    const emojiChar = String.fromCodePoint(cp);
    assert.equal(
      originalMessage.includes(emojiChar),
      true,
      `[${label}] Original message must include emoji 0x${cp.toString(16).toUpperCase()}`
    );
    assert.equal(
      decodedMessage.includes(emojiChar),
      true,
      `[${label}] Decoded message must include emoji 0x${cp.toString(16).toUpperCase()}`
    );
  }

  // 4. Quebras de linha preservadas
  const lines = decodedMessage.split('\n');
  assert.ok(lines.length >= minLines, `[${label}] Expected at least ${minLines} lines, got ${lines.length}`);
  assert.ok(url.includes('%0A') || url.includes('%0a'), `[${label}] URL must encode line breaks as %0A`);

  // 5. Marcadores de negrito do WhatsApp (*texto*) preservados sem markdown duplo (**)
  assert.equal(decodedMessage.includes('**'), false, `[${label}] Must not contain double asterisk (**)`);
  for (const boldSeg of expectedBoldSegments) {
    assert.equal(
      decodedMessage.includes(boldSeg),
      true,
      `[${label}] Decoded message must contain bold segment ${boldSeg}`
    );
  }

  // 6. Acentuacao em portugues preservada
  for (const word of expectedAccentedWords) {
    assert.equal(
      decodedMessage.includes(word),
      true,
      `[${label}] Decoded message must preserve accented word "${word}"`
    );
  }
}

describe('WhatsApp Message Builder & Emoji Encoding Regression Suite', () => {
  const originRegex = /\[(site-[a-z0-9-]+|balao-flutuante|chat-flutuante|botao-flutuante|antes-depois)\]/i;

  it('1. WHATSAPP_EMOJIS dictionary is built with valid runtime Unicode code points and zero U+FFFD', () => {
    const expectedPairs: Array<[keyof typeof WHATSAPP_EMOJIS, number]> = [
      ['wave', 0x1F44B],
      ['smile', 0x1F60A],
      ['user', 0x1F464],
      ['tools', 0x1F6E0],
      ['car', 0x1F697],
      ['shield', 0x1F6E1],
      ['wrench', 0x1F527],
      ['memo', 0x1F4DD],
    ];

    for (const [key, expectedCp] of expectedPairs) {
      const val = WHATSAPP_EMOJIS[key];
      assert.strictEqual(val, DIRECT_WHATSAPP_EMOJIS[key]);
      assert.equal(val.includes('\uFFFD'), false, `Emoji "${key}" must not contain U+FFFD`);
      assert.equal(val.codePointAt(0), expectedCp, `Emoji "${key}" must have code point 0x${expectedCp.toString(16)}`);
      assert.equal(val.includes(String.fromCodePoint(expectedCp)), true);
    }
  });

  it('2. General budget message (Hero, Header, Footer, Mobile Drawer) passes all U+FFFD and emoji code point checks', () => {
    const sections = ['site-header', 'site-hero', 'site-footer', 'site-drawer-mobile'];
    for (const section of sections) {
      const originalMessage = buildWhatsAppMessage({ originSection: section });
      const url = buildWhatsAppUrl({ originSection: section });
      const decodedMessage = getDecodedText(url);

      assert.ok(url.startsWith(`https://wa.me/${businessData.phoneRaw}?text=`));
      assert.equal(originRegex.test(decodedMessage), false);
      assert.equal(decodedMessage.includes(section), false);

      assertValidWhatsAppOutput({
        label: `general-${section}`,
        originalMessage,
        url,
        expectedEmojiCodePoints: [0x1F44B, 0x1F60A],
        expectedAccentedWords: ['Olá', 'orçamento'],
        expectedBoldSegments: ['*Garagem Mailasque*'],
        minLines: 5,
      });
    }
  });

  it('3. Every predefined WhatsApp CTA template produces valid emojis, zero U+FFFD, preserved line breaks, bold markers, and Portuguese accents', () => {
    const predefinedTemplates = [
      {
        label: 'general',
        originSection: 'site-hero',
        originalMessage: WHATSAPP_TEMPLATES.general(),
        expectedEmojiCodePoints: [0x1F44B, 0x1F60A],
        expectedAccentedWords: ['Olá', 'orçamento'],
        expectedBoldSegments: ['*Garagem Mailasque*'],
        minLines: 5,
      },
      {
        label: 'floatingBubble',
        originSection: 'balao-flutuante',
        originalMessage: WHATSAPP_TEMPLATES.floatingBubble(),
        expectedEmojiCodePoints: [0x1F44B, 0x1F60A],
        expectedAccentedWords: ['Olá', 'orçamento', 'veículo'],
        expectedBoldSegments: ['*Garagem Mailasque*'],
        minLines: 5,
      },
      {
        label: 'floatingChatFallback',
        originSection: 'chat-flutuante',
        originalMessage: WHATSAPP_TEMPLATES.floatingChatFallback(),
        expectedEmojiCodePoints: [0x1F44B, 0x1F60A],
        expectedAccentedWords: ['Olá', 'dúvida'],
        expectedBoldSegments: ['*Garagem Mailasque*'],
        minLines: 5,
      },
      {
        label: 'floatingButtonDefault',
        originSection: 'botao-flutuante',
        originalMessage: WHATSAPP_TEMPLATES.floatingButtonDefault(),
        expectedEmojiCodePoints: [0x1F44B, 0x1F60A],
        expectedAccentedWords: ['Olá', 'orçamento'],
        expectedBoldSegments: ['*Garagem Mailasque*'],
        minLines: 5,
      },
      {
        label: 'insurers',
        originSection: 'site-seguradoras',
        originalMessage: WHATSAPP_TEMPLATES.insurers(),
        expectedEmojiCodePoints: [0x1F44B, 0x1F60A],
        expectedAccentedWords: ['Olá', 'orientações', 'vocês'],
        expectedBoldSegments: ['*Garagem Mailasque*'],
        minLines: 5,
      },
      {
        label: 'partnerApvs',
        originSection: 'site-parceria-apvs',
        originalMessage: WHATSAPP_TEMPLATES.partnerApvs(),
        expectedEmojiCodePoints: [0x1F44B, 0x1F60A],
        expectedAccentedWords: ['Olá', 'informações', 'proteção'],
        expectedBoldSegments: ['*Garagem Mailasque*', '*APVS Brasil*'],
        minLines: 5,
      },
      {
        label: 'paymentSimulator',
        originSection: 'site-simulador',
        originalMessage: WHATSAPP_TEMPLATES.paymentSimulator('R$ 1.500,00'),
        expectedEmojiCodePoints: [0x1F44B, 0x1F60A],
        expectedAccentedWords: ['Olá', 'simulação', 'referência', 'avaliação', 'veículo'],
        expectedBoldSegments: ['*Garagem Mailasque*', '*R$ 1.500,00*'],
        minLines: 7,
      },
      {
        label: 'beforeAfterCase',
        originSection: 'antes-depois',
        originalMessage: WHATSAPP_TEMPLATES.beforeAfterCase('Honda City', 'Honda City 2021'),
        expectedEmojiCodePoints: [0x1F44B, 0x1F60A],
        expectedAccentedWords: ['Olá', 'orçamento'],
        expectedBoldSegments: ['*Garagem Mailasque*', '*Honda City*'],
        minLines: 5,
      },
      {
        label: 'beforeAfterFallback',
        originSection: 'antes-depois',
        originalMessage: WHATSAPP_TEMPLATES.beforeAfterFallback(),
        expectedEmojiCodePoints: [0x1F44B, 0x1F60A],
        expectedAccentedWords: ['Olá', 'veículo'],
        expectedBoldSegments: ['*Garagem Mailasque*'],
        minLines: 5,
      },
    ];

    for (const item of predefinedTemplates) {
      const url = buildWhatsAppUrl({
        originSection: item.originSection,
        customText: item.originalMessage,
      });

      assertValidWhatsAppOutput({
        label: item.label,
        originalMessage: item.originalMessage,
        url,
        expectedEmojiCodePoints: item.expectedEmojiCodePoints,
        expectedAccentedWords: item.expectedAccentedWords,
        expectedBoldSegments: item.expectedBoldSegments,
        minLines: item.minLines,
      });
    }
  });

  it('4. Service-specific predefined messages pass all U+FFFD and emoji code point checks', () => {
    for (const service of services) {
      const originalMessage = buildWhatsAppMessage({
        originSection: `site-servico-${service.id}`,
        service: service.name,
      });
      const url = buildWhatsAppUrl({
        originSection: `site-servico-${service.id}`,
        service: service.name,
      });
      const decodedMessage = getDecodedText(url);

      assert.equal(service.whatsappMessage.includes('\uFFFD'), false);
      assert.equal(originalMessage, service.whatsappMessage);
      assert.equal(decodedMessage, service.whatsappMessage);

      assertValidWhatsAppOutput({
        label: `service-${service.id}`,
        originalMessage,
        url,
        expectedEmojiCodePoints: [0x1F44B, 0x1F60A],
        expectedAccentedWords: ['Olá', 'orçamento'],
        expectedBoldSegments: ['*Garagem Mailasque*', `*${service.name}*`],
        minLines: 5,
      });
    }
  });

  it('5. Quote form template and multi-param builder preserve all structured fields and emoji code points without U+FFFD', () => {
    const originalMessage = WHATSAPP_TEMPLATES.quoteForm({
      name: 'Carlos Oliveira',
      service: 'Funilaria',
      vehicle: 'Toyota Corolla',
      vehicleYear: '2022',
      isInsurance: 'Sim',
      parts: 'Para-choque dianteiro, Capô',
      details: 'Batida leve no trânsito, sem vazamento de fluidos.',
    });

    const url = buildWhatsAppUrl({
      originSection: 'site-form',
      customText: originalMessage,
    });

    assertValidWhatsAppOutput({
      label: 'quoteForm',
      originalMessage,
      url,
      expectedEmojiCodePoints: [
        0x1F44B, // wave
        0x1F464, // user
        0x1F6E0, // tools
        0x1F697, // car
        0x1F6E1, // shield
        0x1F527, // wrench
        0x1F4DD, // memo
        0x1F60A, // smile
      ],
      expectedAccentedWords: ['Olá', 'orçamento', 'Serviço', 'Veículo', 'Peças', 'Capô', 'trânsito'],
      expectedBoldSegments: [
        '*Garagem Mailasque*',
        '*Nome:*',
        '*Serviço:*',
        '*Veículo:*',
        '*Seguro:*',
        '*Peças a reparar:*',
        '*Detalhes:*',
      ],
      minLines: 11,
    });

    // Multi-param builder direct call
    const multiParamOriginal = buildWhatsAppMessage({
      service: 'Pintura',
      vehicle: 'Honda Civic',
      isInsurance: false,
    });
    const multiParamUrl = buildWhatsAppUrl({
      service: 'Pintura',
      vehicle: 'Honda Civic',
      isInsurance: false,
    });

    assertValidWhatsAppOutput({
      label: 'multiParamBuilder',
      originalMessage: multiParamOriginal,
      url: multiParamUrl,
      expectedEmojiCodePoints: [0x1F44B, 0x1F6E0, 0x1F697, 0x1F6E1, 0x1F60A],
      expectedAccentedWords: ['Olá', 'orçamento', 'Serviço', 'Veículo', 'Não'],
      expectedBoldSegments: ['*Garagem Mailasque*', '*Serviço:*', '*Veículo:*', '*Seguro:*'],
      minLines: 8,
    });
  });

  it('6. User-written chat messages and floating chat fallback preserve exact text without U+FFFD', () => {
    const userMessage = 'Boa tarde! Vocês trabalham com recuperação de parachoque de fibra?';
    const urlWithUserInput = buildWhatsAppUrl({
      originSection: 'chat-flutuante',
      customText: userMessage,
    });
    const decodedWithInput = getDecodedText(urlWithUserInput);

    assert.equal(userMessage.includes('\uFFFD'), false);
    assert.equal(decodedWithInput.includes('\uFFFD'), false);
    assert.equal(userMessage, decodedWithInput);

    const fallbackMessage = WHATSAPP_TEMPLATES.floatingChatFallback();
    const urlWithFallback = buildWhatsAppUrl({
      originSection: 'chat-flutuante',
      customText: fallbackMessage,
    });
    const decodedWithFallback = getDecodedText(urlWithFallback);

    assert.equal(fallbackMessage.includes('\uFFFD'), false);
    assert.equal(decodedWithFallback.includes('\uFFFD'), false);
    assert.equal(fallbackMessage, decodedWithFallback);
    assert.equal(decodedWithFallback.includes(String.fromCodePoint(0x1F44B)), true);
    assert.equal(decodedWithFallback.includes(String.fromCodePoint(0x1F60A)), true);
  });

  it('7. Existing analytics tracking remains functional and does not receive message text or personal data', () => {
    const dirtyParams = {
      name: 'João da Silva',
      phone: '11999998888',
      whatsapp: '5511999998888',
      message: 'Olá gostaria de orçamento',
      placa: 'ABC-1234',
      section: 'site-hero',
      service_name: 'Funilaria',
    };

    const sanitized = sanitizeEventParams(dirtyParams);
    assert.strictEqual(sanitized.name, undefined);
    assert.strictEqual(sanitized.phone, undefined);
    assert.strictEqual(sanitized.whatsapp, undefined);
    assert.strictEqual(sanitized.message, undefined);
    assert.strictEqual(sanitized.placa, undefined);
    assert.strictEqual(sanitized.section, 'site-hero');
    assert.strictEqual(sanitized.service_name, 'Funilaria');

    const mockWindow = { dataLayer: [] as unknown[] };
    (globalThis as unknown as { window: typeof mockWindow }).window = mockWindow;

    const mockStorage: Record<string, string> = {
      gm_cookie_consent_v1: 'granted',
      gm_cookie_preferences_v2: JSON.stringify({ necessary: true, analytics: true, marketing: true }),
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
      },
      key: (i: number) => Object.keys(mockStorage)[i] ?? null,
      length: Object.keys(mockStorage).length,
    } as Storage;

    trackWhatsAppConversion('header');
    assert.strictEqual(mockWindow.dataLayer.length, 1);
    const event = mockWindow.dataLayer[0] as Record<string, unknown>;
    assert.strictEqual(event.event, 'whatsapp_click');
    assert.strictEqual(event.section, 'header');
    assert.strictEqual(event.channel, 'whatsapp');
    assert.strictEqual(event.text, undefined);

    trackLeadSubmission({
      service: 'Pintura',
      isInsurance: 'Não',
      hasYear: true,
      partsCount: 2,
      hasNotes: false,
    });
    assert.strictEqual(mockWindow.dataLayer.length, 2);
    const leadEvent = mockWindow.dataLayer[1] as Record<string, unknown>;
    assert.strictEqual(leadEvent.event, 'generate_lead');
    assert.strictEqual(leadEvent.service_type, 'Pintura');
    assert.strictEqual(leadEvent.is_insurance, 'Não');
    assert.strictEqual(leadEvent.name, undefined);
    assert.strictEqual(leadEvent.phone, undefined);
  });
});
