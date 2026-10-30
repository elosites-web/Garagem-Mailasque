/**
 * Mapa de emojis construidos em tempo de execucao via String.fromCodePoint()
 * utilizando exclusivamente caracteres ASCII no codigo-fonte para garantir
 * codificacao segura e evitar corrupcao de caracteres (U+FFFD).
 */
export const WHATSAPP_EMOJIS = {
  wave: String.fromCodePoint(0x1F44B),
  smile: String.fromCodePoint(0x1F60A),
  user: String.fromCodePoint(0x1F464),
  tools: String.fromCodePoint(0x1F6E0),
  car: String.fromCodePoint(0x1F697),
  shield: String.fromCodePoint(0x1F6E1),
  wrench: String.fromCodePoint(0x1F527),
  memo: String.fromCodePoint(0x1F4DD),
} as const;

export const whatsappEmojis = WHATSAPP_EMOJIS;

export type WhatsAppEmojiKey = keyof typeof WHATSAPP_EMOJIS;

export default WHATSAPP_EMOJIS;
