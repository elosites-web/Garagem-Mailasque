import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  businessData,
  WHATSAPP_TEMPLATES,
} from '../src/data/business';
import { services } from '../src/data/services';
import { trackWhatsAppConversion, trackLeadSubmission, sanitizeEventParams } from '../src/utils/analytics';

/**
 * Extrai e decodifica o parâmetro 'text' usando a API padrão URL / URLSearchParams.
 */
function getDecodedText(whatsappUrl: string): string {
  const urlObj = new URL(whatsappUrl);
  return urlObj.searchParams.get('text') || '';
}

/**
 * Regex abrangente para detectar qualquer emoji (Extended_Pictographic, Emoji_Presentation ou pares substitutos astrais).
 */
const EMOJI_REGEX = /\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|\uFE0F/u;

/**
 * Valida rigorosamente qualquer mensagem predefinida e sua respectiva URL do WhatsApp:
 * 1. Ausência total de emojis
 * 2. Ausência de U+FFFD tanto na mensagem original quanto na decodificada e ausência de %EF%BF%BD na URL
 * 3. Preservação de formatação em negrito com asterisco simples (*texto*) sem duplo asterisco (**)
 * 4. Preservação de todas as quebras de linha intencionais e separação de parágrafos
 * 5. Preservação de caracteres acentuados do português
 * 6. Comparação exata round-trip (originalMessage === decodedMessage)
 * 7. Ausência de identificadores internos de origem ([site-header], [chat-flutuante], etc.)
 */
function assertValidEmojiFreeWhatsAppOutput(params: {
  label: string;
  originalMessage: string;
  url: string;
  expectedExactText: string;
  expectedAccentedWords: string[];
  expectedBoldSegments: string[];
  expectedLineCount: number;
}) {
  const {
    label,
    originalMessage,
    url,
    expectedExactText,
    expectedAccentedWords,
    expectedBoldSegments,
    expectedLineCount,
  } = params;

  const decodedMessage = getDecodedText(url);

  // 1. Nenhum emoji permitido em mensagens predefinidas
  assert.equal(
    EMOJI_REGEX.test(originalMessage),
    false,
    `[${label}] Original message must not contain any emojis: ${originalMessage}`
  );
  assert.equal(
    EMOJI_REGEX.test(decodedMessage),
    false,
    `[${label}] Decoded message must not contain any emojis: ${decodedMessage}`
  );

  // 2. Nenhuma das strings pode conter U+FFFD
  assert.equal(originalMessage.includes('\uFFFD'), false, `[${label}] Original message must not contain U+FFFD`);
  assert.equal(decodedMessage.includes('\uFFFD'), false, `[${label}] Decoded message must not contain U+FFFD`);
  assert.equal(url.includes('\uFFFD'), false, `[${label}] URL must not contain U+FFFD`);
  assert.equal(url.includes('%EF%BF%BD'), false, `[${label}] Encoded URL must not contain %EF%BF%BD`);
  assert.equal(url.includes('%25'), false, `[${label}] URL must not contain double-encoded sequences (%25)`);

  // 3. Round-trip exato e correspondência com o texto esperado
  assert.equal(originalMessage, expectedExactText, `[${label}] Original message must match expected formatted text`);
  assert.equal(decodedMessage, expectedExactText, `[${label}] Decoded message must match expected formatted text`);
  assert.equal(originalMessage, decodedMessage, `[${label}] Round-trip originalMessage must equal decodedMessage`);

  // 4. Quebras de linha e separação de parágrafos preservadas (não achatado em parágrafo único)
  const lines = decodedMessage.split('\n');
  assert.equal(
    lines.length,
    expectedLineCount,
    `[${label}] Expected exactly ${expectedLineCount} lines, got ${lines.length}`
  );
  assert.equal(lines[0], 'Olá, *Garagem Mailasque*!', `[${label}] First line must be greeting with bold business name`);
  assert.equal(lines[1], '', `[${label}] Second line must be blank paragraph separator`);
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

  // 6. Acentuação em português preservada
  for (const word of expectedAccentedWords) {
    assert.equal(
      decodedMessage.includes(word),
      true,
      `[${label}] Decoded message must preserve accented word "${word}"`
    );
  }
}

describe('WhatsApp Predefined Messages (Emoji-Free, Formatted & Validated)', () => {
  const originRegex = /\[(site-[a-z0-9-]+|balao-flutuante|chat-flutuante|botao-flutuante|antes-depois)\]/i;

  it('1. General budget CTAs (Header, Mobile Drawer, Hero, Footer) match reference formatting with zero emojis and zero U+FFFD', () => {
    const expectedGeneralMessage = [
      'Olá, *Garagem Mailasque*!',
      '',
      'Vim pelo site e gostaria de solicitar um *orçamento*.',
      '',
      'Podem me orientar, por favor?',
    ].join('\n');

    const sections = ['site-header', 'site-hero', 'site-footer', 'site-drawer-mobile'];
    for (const section of sections) {
      const originalMessage = buildWhatsAppMessage({ originSection: section });
      const url = buildWhatsAppUrl({ originSection: section });
      const decodedMessage = getDecodedText(url);

      assert.ok(url.startsWith(`https://wa.me/${businessData.phoneRaw}?text=`));
      assert.equal(originRegex.test(decodedMessage), false);
      assert.equal(decodedMessage.includes(section), false);

      assertValidEmojiFreeWhatsAppOutput({
        label: `general-${section}`,
        originalMessage,
        url,
        expectedExactText: expectedGeneralMessage,
        expectedAccentedWords: ['Olá', 'orçamento'],
        expectedBoldSegments: ['*Garagem Mailasque*', '*orçamento*'],
        expectedLineCount: 5,
      });
    }
  });

  it('2. All predefined section CTAs (Floating Bubble, Floating Chat Fallback, Floating Button, Insurers, APVS, Simulator, Before/After) contain no emojis and preserve bold & line breaks', () => {
    const predefinedCases = [
      {
        label: 'floatingBubble',
        originSection: 'balao-flutuante',
        originalMessage: WHATSAPP_TEMPLATES.floatingBubble(),
        expectedExactText: [
          'Olá, *Garagem Mailasque*!',
          '',
          'Vi o recado no site e gostaria de solicitar um *orçamento* para o meu veículo.',
          '',
          'Podem me orientar, por favor?',
        ].join('\n'),
        expectedAccentedWords: ['Olá', 'orçamento', 'veículo'],
        expectedBoldSegments: ['*Garagem Mailasque*', '*orçamento*'],
        expectedLineCount: 5,
      },
      {
        label: 'floatingChatFallback',
        originSection: 'chat-flutuante',
        originalMessage: WHATSAPP_TEMPLATES.floatingChatFallback(),
        expectedExactText: [
          'Olá, *Garagem Mailasque*!',
          '',
          'Vim pelo site e gostaria de tirar uma dúvida sobre *funilaria e pintura*.',
          '',
          'Podem me orientar, por favor?',
        ].join('\n'),
        expectedAccentedWords: ['Olá', 'dúvida'],
        expectedBoldSegments: ['*Garagem Mailasque*', '*funilaria e pintura*'],
        expectedLineCount: 5,
      },
      {
        label: 'floatingButtonDefault',
        originSection: 'botao-flutuante',
        originalMessage: WHATSAPP_TEMPLATES.floatingButtonDefault(),
        expectedExactText: [
          'Olá, *Garagem Mailasque*!',
          '',
          'Vim pelo site e gostaria de solicitar um orçamento para *funilaria e pintura*.',
          '',
          'Podem me orientar, por favor?',
        ].join('\n'),
        expectedAccentedWords: ['Olá', 'orçamento'],
        expectedBoldSegments: ['*Garagem Mailasque*', '*funilaria e pintura*'],
        expectedLineCount: 5,
      },
      {
        label: 'insurers',
        originSection: 'site-seguradoras',
        originalMessage: WHATSAPP_TEMPLATES.insurers(),
        expectedExactText: [
          'Olá, *Garagem Mailasque*!',
          '',
          'Acionei o *sinistro pelo seguro* e gostaria de orientações para consertar meu carro na oficina de vocês.',
          '',
          'Como podemos proceder?',
        ].join('\n'),
        expectedAccentedWords: ['Olá', 'orientações', 'vocês'],
        expectedBoldSegments: ['*Garagem Mailasque*', '*sinistro pelo seguro*'],
        expectedLineCount: 5,
      },
      {
        label: 'partnerApvs',
        originSection: 'site-parceria-apvs',
        originalMessage: WHATSAPP_TEMPLATES.partnerApvs(),
        expectedExactText: [
          'Olá, *Garagem Mailasque*!',
          '',
          'Gostaria de mais informações sobre a proteção veicular *APVS Brasil* na oficina.',
          '',
          'Poderiam me orientar, por favor?',
        ].join('\n'),
        expectedAccentedWords: ['Olá', 'informações', 'proteção'],
        expectedBoldSegments: ['*Garagem Mailasque*', '*APVS Brasil*'],
        expectedLineCount: 5,
      },
      {
        label: 'paymentSimulator',
        originSection: 'site-simulador',
        originalMessage: WHATSAPP_TEMPLATES.paymentSimulator('R$ 1.500,00'),
        expectedExactText: [
          'Olá, *Garagem Mailasque*!',
          '',
          'Fiz uma simulação de referência no site no valor de *R$ 1.500,00*.',
          '',
          'Gostaria de agendar uma *avaliação* para o meu veículo.',
          '',
          'Podem me orientar, por favor?',
        ].join('\n'),
        expectedAccentedWords: ['Olá', 'simulação', 'referência', 'avaliação', 'veículo'],
        expectedBoldSegments: ['*Garagem Mailasque*', '*R$ 1.500,00*', '*avaliação*'],
        expectedLineCount: 7,
      },
      {
        label: 'beforeAfterCase',
        originSection: 'antes-depois',
        originalMessage: WHATSAPP_TEMPLATES.beforeAfterCase('Honda City', 'Honda City 2021'),
        expectedExactText: [
          'Olá, *Garagem Mailasque*!',
          '',
          'Vi o caso de *Honda City* (Honda City 2021) no site e gostaria de solicitar um *orçamento* para o meu carro.',
          '',
          'Podem me orientar, por favor?',
        ].join('\n'),
        expectedAccentedWords: ['Olá', 'orçamento'],
        expectedBoldSegments: ['*Garagem Mailasque*', '*Honda City*', '*orçamento*'],
        expectedLineCount: 5,
      },
      {
        label: 'beforeAfterFallback',
        originSection: 'antes-depois',
        originalMessage: WHATSAPP_TEMPLATES.beforeAfterFallback(),
        expectedExactText: [
          'Olá, *Garagem Mailasque*!',
          '',
          'Vim pelo site e gostaria de ver fotos e exemplos de *reparos recentes* semelhantes ao do meu veículo.',
          '',
          'Poderiam me enviar, por favor?',
        ].join('\n'),
        expectedAccentedWords: ['Olá', 'veículo'],
        expectedBoldSegments: ['*Garagem Mailasque*', '*reparos recentes*'],
        expectedLineCount: 5,
      },
    ];

    for (const tc of predefinedCases) {
      const url = buildWhatsAppUrl({
        originSection: tc.originSection,
        customText: tc.originalMessage,
      });
      const decodedMessage = getDecodedText(url);

      assert.equal(originRegex.test(decodedMessage), false);
      assert.equal(decodedMessage.includes(tc.originSection), false);

      assertValidEmojiFreeWhatsAppOutput({
        label: tc.label,
        originalMessage: tc.originalMessage,
        url,
        expectedExactText: tc.expectedExactText,
        expectedAccentedWords: tc.expectedAccentedWords,
        expectedBoldSegments: tc.expectedBoldSegments,
        expectedLineCount: tc.expectedLineCount,
      });
    }
  });

  it('3. Service-specific buttons produce emoji-free formatted messages with bold service names', () => {
    for (const service of services) {
      const expectedServiceText = [
        'Olá, *Garagem Mailasque*!',
        '',
        `Gostaria de solicitar um orçamento para *${service.name}*.`,
        '',
        'Podem me orientar, por favor?',
      ].join('\n');

      const originalMessage = buildWhatsAppMessage({
        originSection: `site-servico-${service.id}`,
        service: service.name,
      });
      const url = buildWhatsAppUrl({
        originSection: `site-servico-${service.id}`,
        service: service.name,
      });
      const decodedMessage = getDecodedText(url);

      assert.equal(originRegex.test(decodedMessage), false);
      assert.equal(service.whatsappMessage, expectedServiceText);

      assertValidEmojiFreeWhatsAppOutput({
        label: `service-${service.id}`,
        originalMessage,
        url,
        expectedExactText: expectedServiceText,
        expectedAccentedWords: ['Olá', 'orçamento'],
        expectedBoldSegments: ['*Garagem Mailasque*', `*${service.name}*`],
        expectedLineCount: 5,
      });
    }
  });

  it('4. Quote form and multi-parameter builder messages contain no emojis while preserving bold field labels and multiline structure', () => {
    const originalMessage = WHATSAPP_TEMPLATES.quoteForm({
      name: 'Carlos Oliveira',
      service: 'Funilaria',
      vehicle: 'Toyota Corolla',
      vehicleYear: '2022',
      isInsurance: 'Sim',
      parts: 'Para-choque dianteiro, Capô',
      details: 'Batida leve no trânsito, sem vazamento de fluidos.',
    });

    const expectedQuoteText = [
      'Olá, *Garagem Mailasque*!',
      '',
      'Vim pelo site e gostaria de solicitar um *orçamento*.',
      '',
      '*Nome:* Carlos Oliveira',
      '*Serviço:* Funilaria',
      '*Veículo:* Toyota Corolla (2022)',
      '*Seguro:* Sim, por seguro',
      '*Peças a reparar:* Para-choque dianteiro, Capô',
      '*Detalhes:* Batida leve no trânsito, sem vazamento de fluidos.',
      '',
      'Podem me orientar, por favor?',
    ].join('\n');

    const url = buildWhatsAppUrl({
      originSection: 'site-form',
      customText: originalMessage,
    });
    const decodedMessage = getDecodedText(url);

    assert.equal(originRegex.test(decodedMessage), false);
    assert.equal(decodedMessage.includes('[site-form]'), false);

    assertValidEmojiFreeWhatsAppOutput({
      label: 'quoteForm',
      originalMessage,
      url,
      expectedExactText: expectedQuoteText,
      expectedAccentedWords: ['Olá', 'orçamento', 'Serviço', 'Veículo', 'Peças', 'Capô', 'trânsito'],
      expectedBoldSegments: [
        '*Garagem Mailasque*',
        '*orçamento*',
        '*Nome:*',
        '*Serviço:*',
        '*Veículo:*',
        '*Seguro:*',
        '*Peças a reparar:*',
        '*Detalhes:*',
      ],
      expectedLineCount: 12,
    });

    // Multi-parameter builder
    const multiParamOriginal = buildWhatsAppMessage({
      service: 'Pintura',
      vehicle: 'Honda Civic',
      isInsurance: false,
    });
    const expectedMultiParamText = [
      'Olá, *Garagem Mailasque*!',
      '',
      'Vim pelo site e gostaria de solicitar um *orçamento*:',
      '',
      '*Serviço:* Pintura',
      '*Veículo:* Honda Civic',
      '*Seguro:* Não, particular',
      '',
      'Podem me orientar, por favor?',
    ].join('\n');
    const multiParamUrl = buildWhatsAppUrl({
      service: 'Pintura',
      vehicle: 'Honda Civic',
      isInsurance: false,
    });

    assertValidEmojiFreeWhatsAppOutput({
      label: 'multiParamBuilder',
      originalMessage: multiParamOriginal,
      url: multiParamUrl,
      expectedExactText: expectedMultiParamText,
      expectedAccentedWords: ['Olá', 'orçamento', 'Serviço', 'Veículo', 'Não'],
      expectedBoldSegments: ['*Garagem Mailasque*', '*orçamento*', '*Serviço:*', '*Veículo:*', '*Seguro:*'],
      expectedLineCount: 9,
    });
  });

  it('5. Visitor-written messages in the floating chat remain completely unchanged', () => {
    const visitorMessage = 'Boa tarde! Vocês fazem reparo no para-choque do Jeep Compass 2023?';
    const url = buildWhatsAppUrl({
      originSection: 'chat-flutuante',
      customText: visitorMessage,
    });
    const decoded = getDecodedText(url);

    assert.equal(decoded, visitorMessage, 'Visitor-typed message must be preserved verbatim');
    assert.equal(originRegex.test(decoded), false);
    assert.equal(decoded.includes('\uFFFD'), false);
  });

  it('6. GA4/GTM analytics click tracking remains independent from customer-facing message text and strips PII', () => {
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
