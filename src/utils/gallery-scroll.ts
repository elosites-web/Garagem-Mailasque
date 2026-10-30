/**
 * Utilitários puros para o cálculo de rolagem vertical controlando a translação horizontal da galeria.
 * Totalmente desacoplados e testáveis unitariamente.
 */

export interface CalculateOverflowParams {
  trackScrollWidth: number;
  containerVisibleWidth: number;
}

export interface CalculateScrollProgressParams {
  rectTop: number;
  totalScrollable: number;
}

export interface CalculateStickyHeightParams {
  viewportHeight: number;
  scrollDistance: number;
  isReducedMotion?: boolean;
}

/**
 * Calcula a distância exata de overflow horizontal que o trilho precisa percorrer.
 * Retorna 0 se o conteúdo couber completamente na largura visível da janela.
 */
export function calculateGalleryOverflow({
  trackScrollWidth,
  containerVisibleWidth,
}: CalculateOverflowParams): number {
  if (trackScrollWidth <= 0 || containerVisibleWidth <= 0) return 0;
  return Math.max(0, trackScrollWidth - containerVisibleWidth);
}

/**
 * Mapeia a coordenada vertical da seção (rect.top) em um progresso normalizado de 0 a 1.
 * - Quando rectTop > 0: a seção ainda não atingiu o topo da tela -> 0
 * - Quando rectTop <= 0 e está na faixa de rolagem -> valor fracionário entre 0 e 1
 * - Quando rectTop <= -totalScrollable: o usuário rolou além do fim da galeria -> 1
 * - Ao rolar para cima: reverte naturalmente sem sobressaltos
 */
export function calculateScrollProgress({
  rectTop,
  totalScrollable,
}: CalculateScrollProgressParams): number {
  if (totalScrollable <= 0) return 0;
  const scrolled = -rectTop;
  if (scrolled <= 0) return 0;
  if (scrolled >= totalScrollable) return 1;
  return scrolled / totalScrollable;
}

/**
 * Calcula a altura total da seção necessária para garantir rolagem contínua e liberação sem saltos.
 */
export function calculateStickyHeight({
  viewportHeight,
  scrollDistance,
  isReducedMotion = false,
}: CalculateStickyHeightParams): string {
  if (isReducedMotion || scrollDistance <= 0) {
    return 'auto';
  }
  return `${viewportHeight + scrollDistance}px`;
}
