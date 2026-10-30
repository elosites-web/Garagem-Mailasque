import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildWhatsAppUrl, businessData, WHATSAPP_EMOJIS } from '../src/data/business';
import { services } from '../src/data/services';
import { trackWhatsAppConversion, trackLeadSubmission, sanitizeEventParams } from '../src/utils/analytics';

/**
 * Helper para extrair e decodificar o parâmetro 'text' usando a API padrão URL,
 * que é compatível com percent-encoding e conversão de '+' em espaços.
 */
function getDecodedText(whatsappUrl: string): string {
  const urlObj = new URL(whatsappUrl);
  return urlObj.searchParams.get('text') || '';
}

describe('WhatsApp Message Builder & Formatting Suite', () => {
  const originRegex = /\[(site-[a-z0-9-]+|balao-flutuante|chat-flutuante|botao-flutuante|antes-depois)\]/i;

  it('1. General messages contain no origin identifiers and have valid emojis without replacement character U+FFFD', () => {
    const sections = ['site-header', 'site-hero', 'site-footer', 'site-drawer-mobile'];
    for (const section of sections) {
      const url = buildWhatsAppUrl({ originSection: section });
      assert.ok(url.startsWith(`https://wa.me/${businessData.phoneRaw}?text=`));

      // Não pode haver caractere de substituição Unicode ( / U+FFFD)
      assert.ok(!url.includes('\uFFFD'), `URL must not contain U+FFFD replacement character`);
      assert.ok(!url.includes('%EF%BF%BD'), `Encoded URL must not contain %EF%BF%BD (UTF-8 for U+FFFD)`);

      // Não pode haver double-encoding (%25)
      assert.ok(!url.includes('%25'), 'URL must not contain double-encoded percent sequences (%25)');

      const decodedText = getDecodedText(url);
      assert.ok(
        !originRegex.test(decodedText),
        `Decoded message for section "${section}" must not contain origin identifier: ${decodedText}`
      );
      assert.ok(!decodedText.includes(section), `Text must not contain section name: ${section}`);
      assert.ok(!decodedText.includes('\uFFFD'), `Decoded text must not contain replacement character U+FFFD`);

      const expectedText = [
        `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}`,
        '',
        'Vim pelo site e gostaria de solicitar um orçamento.',
        '',
        `Podem me orientar, por favor? ${WHATSAPP_EMOJIS.smile}`,
      ].join('\n');

      assert.strictEqual(decodedText, expectedText);

      // Validação explícita de code point dos emojis
      assert.ok(decodedText.includes(WHATSAPP_EMOJIS.wave), 'Must include waving hand emoji');
      assert.ok(decodedText.includes(WHATSAPP_EMOJIS.smile), 'Must include smiling emoji');
      assert.strictEqual(WHATSAPP_EMOJIS.wave.codePointAt(0), 0x1f44b, 'Wave code point must be 0x1F44B');
      assert.strictEqual(WHATSAPP_EMOJIS.smile.codePointAt(0), 0x1f60a, 'Smile code point must be 0x1F60A');
    }
  });

  it('2. Custom predefined messages contain no origin identifiers and preserve Unicode emojis', () => {
    const testCases = [
      {
        originSection: 'balao-flutuante',
        customText: [
          `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}`,
          '',
          'Vi o recado no site e gostaria de solicitar um orçamento para o meu veículo.',
          '',
          `Podem me orientar, por favor? ${WHATSAPP_EMOJIS.smile}`,
        ].join('\n'),
      },
      {
        originSection: 'site-seguradoras',
        customText: [
          `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}`,
          '',
          'Acionei o sinistro pelo seguro e gostaria de orientações para consertar meu carro na oficina de vocês.',
          '',
          `Como podemos proceder? ${WHATSAPP_EMOJIS.smile}`,
        ].join('\n'),
      },
      {
        originSection: 'site-parceria-apvs',
        customText: [
          `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}`,
          '',
          'Gostaria de mais informações sobre a proteção veicular *APVS Brasil* na oficina.',
          '',
          `Poderiam me orientar, por favor? ${WHATSAPP_EMOJIS.smile}`,
        ].join('\n'),
      },
      {
        originSection: 'site-simulador',
        customText: [
          `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}`,
          '',
          'Fiz uma simulação de referência no site no valor de *R$ 1.500,00*.',
          '',
          'Gostaria de agendar uma avaliação para o meu veículo.',
          '',
          `Podem me orientar, por favor? ${WHATSAPP_EMOJIS.smile}`,
        ].join('\n'),
      },
      {
        originSection: 'antes-depois',
        customText: [
          `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}`,
          '',
          'Vi o caso de *Honda City* (Honda City 2021) no site e gostaria de solicitar um orçamento para o meu carro.',
          '',
          `Podem me orientar, por favor? ${WHATSAPP_EMOJIS.smile}`,
        ].join('\n'),
      },
      {
        originSection: 'botao-flutuante',
        customText: [
          `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}`,
          '',
          'Vim pelo site e gostaria de solicitar um orçamento para funilaria e pintura.',
          '',
          `Podem me orientar, por favor? ${WHATSAPP_EMOJIS.smile}`,
        ].join('\n'),
      },
    ];

    for (const tc of testCases) {
      const url = buildWhatsAppUrl(tc);
      assert.ok(!url.includes('\uFFFD'), `URL must not contain U+FFFD replacement character`);
      assert.ok(!url.includes('%EF%BF%BD'), `Encoded URL must not contain %EF%BF%BD`);
      assert.ok(!url.includes('%25'), 'URL must not contain double encoded sequences');

      const decodedText = getDecodedText(url);

      assert.ok(
        !originRegex.test(decodedText),
        `Custom text for ${tc.originSection} must not contain origin identifier: ${decodedText}`
      );
      assert.ok(!decodedText.includes(tc.originSection), `Must not contain section label: ${tc.originSection}`);
      assert.ok(!decodedText.includes('\uFFFD'), `Decoded text must not contain U+FFFD`);
      assert.strictEqual(decodedText, tc.customText);
    }
  });

  it('3. Multiline messages preserve line breaks and proper URL encoding', () => {
    const rawLines = ['Linha 1', '', 'Linha 2', '', 'Linha 3'];
    const customText = rawLines.join('\n');
    const url = buildWhatsAppUrl({ originSection: 'test-section', customText });

    assert.ok(url.includes('%0A') || url.includes('%0a'), 'Encoded URL must contain %0A for line breaks');
    assert.ok(!url.includes('Linha 1 Linha 2'), 'Must not flatten lines into a space-separated paragraph');

    const decodedText = getDecodedText(url);
    const splitLines = decodedText.split('\n');
    assert.strictEqual(splitLines.length, 5, 'Decoded message must preserve exact line break count');
    assert.strictEqual(splitLines[0], 'Linha 1');
    assert.strictEqual(splitLines[1], '');
    assert.strictEqual(splitLines[2], 'Linha 2');
    assert.strictEqual(splitLines[3], '');
    assert.strictEqual(splitLines[4], 'Linha 3');
  });

  it('4. Bold formatting uses WhatsApp-compatible single asterisks', () => {
    const url = buildWhatsAppUrl({
      originSection: 'test-section',
      service: 'Funilaria',
    });
    const decodedText = getDecodedText(url);

    // Não deve conter negrito em estilo markdown de dois asteriscos (**)
    assert.ok(!decodedText.includes('**'), 'Must not contain double asterisks Markdown formatting (**)');
    // Deve conter *Garagem Mailasque* e *Funilaria*
    assert.ok(decodedText.includes('*Garagem Mailasque*'), 'Must contain *Garagem Mailasque* in WhatsApp bold');
    assert.ok(decodedText.includes('*Funilaria*'), 'Must contain *Funilaria* in WhatsApp bold');
  });

  it('5. Emojis and Portuguese characters are preserved without corruption', () => {
    const specialText = `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave} Cotação para reparação de lataria & pintura automotiva no balcão de São Roque. ${WHATSAPP_EMOJIS.smile}`;
    const url = buildWhatsAppUrl({
      originSection: 'test-emoji',
      customText: specialText,
    });
    const decodedText = getDecodedText(url);

    assert.strictEqual(decodedText, specialText);
    assert.ok(!decodedText.includes('\uFFFD'), 'Must not contain replacement character U+FFFD');
    assert.ok(decodedText.includes(WHATSAPP_EMOJIS.wave), 'Must retain waving hand emoji');
    assert.ok(decodedText.includes(WHATSAPP_EMOJIS.smile), 'Must retain smiling face emoji');
    assert.ok(decodedText.includes('ç') && decodedText.includes('ã'), 'Must retain special Portuguese characters (ç, ã)');
    assert.ok(decodedText.includes('&'), 'Must retain ampersand');
  });

  it('6. Service-specific messages retain the correct service name and emoji escapes', () => {
    for (const service of services) {
      const url = buildWhatsAppUrl({
        originSection: `site-servico-${service.id}`,
        service: service.name,
      });
      const decodedText = getDecodedText(url);

      assert.ok(
        !originRegex.test(decodedText),
        `Service message for ${service.name} must not contain origin identifier`
      );
      assert.ok(
        decodedText.includes(`Gostaria de solicitar um orçamento para *${service.name}*.`),
        `Must contain formatted request for service ${service.name}`
      );
      assert.ok(!decodedText.includes('**'), 'Must not contain double asterisks');
      assert.ok(!decodedText.includes('\uFFFD'), 'Must not contain U+FFFD');
      assert.strictEqual(decodedText, service.whatsappMessage);
    }
  });

  it('7. Quote form messages preserve all structured fields and Unicode emoji code points', () => {
    const formData = {
      name: 'Carlos Oliveira',
      service: 'Funilaria',
      vehicle: 'Toyota Corolla',
      vehicleYear: '2022',
      isInsurance: 'Sim',
      parts: ['Para-choque dianteiro', 'Capô'],
      details: 'Batida leve no trânsito, sem vazamento de fluidos.',
    };

    const lines: string[] = [
      `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}`,
      '',
      'Vim pelo site e gostaria de solicitar um orçamento.',
      '',
      `${WHATSAPP_EMOJIS.user} *Nome:* ${formData.name}`,
      `${WHATSAPP_EMOJIS.tools} *Serviço:* ${formData.service}`,
      `${WHATSAPP_EMOJIS.car} *Veículo:* ${formData.vehicle} (${formData.vehicleYear})`,
      `${WHATSAPP_EMOJIS.shield} *Seguro:* ${formData.isInsurance === 'Sim' ? 'Sim, por seguro' : 'Não, particular'}`,
      `${WHATSAPP_EMOJIS.wrench} *Peças a reparar:* ${formData.parts.join(', ')}`,
      `${WHATSAPP_EMOJIS.memo} *Detalhes:* ${formData.details}`,
      '',
      `Podem me orientar, por favor? ${WHATSAPP_EMOJIS.smile}`,
    ];

    const customText = lines.join('\n');
    const url = buildWhatsAppUrl({
      originSection: 'site-form',
      customText,
    });
    const decodedText = getDecodedText(url);

    assert.ok(!url.includes('\uFFFD'), 'URL must not contain U+FFFD');
    assert.ok(!url.includes('%EF%BF%BD'), 'URL must not contain %EF%BF%BD');
    assert.ok(!url.includes('%25'), 'URL must not contain double encoded %25');
    assert.ok(!originRegex.test(decodedText), 'Quote form URL must not contain origin identifier');
    assert.ok(!decodedText.includes('[site-form]'), 'Quote form URL must not contain [site-form]');
    assert.ok(!decodedText.includes('\uFFFD'), 'Decoded text must not contain U+FFFD');

    assert.ok(decodedText.includes(`${WHATSAPP_EMOJIS.user} *Nome:* Carlos Oliveira`));
    assert.ok(decodedText.includes(`${WHATSAPP_EMOJIS.tools} *Serviço:* Funilaria`));
    assert.ok(decodedText.includes(`${WHATSAPP_EMOJIS.car} *Veículo:* Toyota Corolla (2022)`));
    assert.ok(decodedText.includes(`${WHATSAPP_EMOJIS.shield} *Seguro:* Sim, por seguro`));
    assert.ok(decodedText.includes(`${WHATSAPP_EMOJIS.wrench} *Peças a reparar:* Para-choque dianteiro, Capô`));
    assert.ok(decodedText.includes(`${WHATSAPP_EMOJIS.memo} *Detalhes:* Batida leve no trânsito, sem vazamento de fluidos.`));
    assert.ok(!decodedText.includes('**'), 'Must use single asterisk for bold labels');

    // Validação dos code points dos emojis
    assert.strictEqual(WHATSAPP_EMOJIS.user.codePointAt(0), 0x1f464);
    assert.strictEqual(WHATSAPP_EMOJIS.tools.codePointAt(0), 0x1f6e0);
    assert.strictEqual(WHATSAPP_EMOJIS.car.codePointAt(0), 0x1f697);
    assert.strictEqual(WHATSAPP_EMOJIS.shield.codePointAt(0), 0x1f6e1);
    assert.strictEqual(WHATSAPP_EMOJIS.wrench.codePointAt(0), 0x1f527);
    assert.strictEqual(WHATSAPP_EMOJIS.memo.codePointAt(0), 0x1f4dd);
  });

  it('8. User-written chat messages are not unintentionally overwritten', () => {
    // Caso A: Usuário digitou texto próprio no chat flutuante
    const userMessage = 'Boa tarde! Vocês trabalham com recuperação de parachoque de fibra?';
    const urlWithUserInput = buildWhatsAppUrl({
      originSection: 'chat-flutuante',
      customText: userMessage,
    });
    const decodedWithInput = getDecodedText(urlWithUserInput);
    assert.strictEqual(
      decodedWithInput,
      userMessage,
      'User-written text must be preserved exactly as typed without replacement or appended origin'
    );
    assert.ok(!originRegex.test(decodedWithInput));
    assert.ok(!decodedWithInput.includes('\uFFFD'));

    // Caso B: Usuário não digitou nada (input vazio), usa fallback formatado
    const fallbackText = [
      `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}`,
      '',
      'Vim pelo site e gostaria de tirar uma dúvida sobre funilaria e pintura.',
      '',
      `Podem me orientar, por favor? ${WHATSAPP_EMOJIS.smile}`,
    ].join('\n');
    const emptyInput: string = '';
    const urlWithFallback = buildWhatsAppUrl({
      originSection: 'chat-flutuante',
      customText: emptyInput || fallbackText,
    });
    const decodedWithFallback = getDecodedText(urlWithFallback);
    assert.strictEqual(decodedWithFallback, fallbackText);
    assert.ok(!originRegex.test(decodedWithFallback));
    assert.ok(!decodedWithFallback.includes('\uFFFD'));
  });

  it('9. Existing analytics tracking remains functional and does not receive message text or personal data', () => {
    // 9.1 Validação de PII sanitizada
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
    assert.strictEqual(sanitized.name, undefined, 'PII name must be stripped');
    assert.strictEqual(sanitized.phone, undefined, 'PII phone must be stripped');
    assert.strictEqual(sanitized.whatsapp, undefined, 'PII whatsapp must be stripped');
    assert.strictEqual(sanitized.message, undefined, 'PII message must be stripped');
    assert.strictEqual(sanitized.placa, undefined, 'PII placa must be stripped');
    assert.strictEqual(sanitized.section, 'site-hero', 'Operational metadata section must be kept');
    assert.strictEqual(sanitized.service_name, 'Funilaria', 'Operational metadata service_name must be kept');

    // 9.2 Simulação de tracking de conversão do WhatsApp
    const mockWindow = { dataLayer: [] as unknown[] };
    (globalThis as unknown as { window: typeof mockWindow }).window = mockWindow;

    // Configura mock de localStorage para consentimento concedido
    const mockStorage: Record<string, string> = {
      gm_cookie_consent_v1: 'granted',
      gm_cookie_preferences_v2: JSON.stringify({ necessary: true, analytics: true, marketing: true }),
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
      key: (i: number) => Object.keys(mockStorage)[i] ?? null,
      length: Object.keys(mockStorage).length,
    } as Storage;

    trackWhatsAppConversion('header');
    assert.strictEqual(mockWindow.dataLayer.length, 1);
    const event = mockWindow.dataLayer[0] as Record<string, unknown>;
    assert.strictEqual(event.event, 'whatsapp_click');
    assert.strictEqual(event.section, 'header');
    assert.strictEqual(event.channel, 'whatsapp');
    assert.strictEqual(event.text, undefined, 'No message text should be in analytics event');

    // 9.3 Simulação de lead submission (separado de whatsapp_click, sem PII)
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
