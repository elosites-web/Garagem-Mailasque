import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, MessageSquare, ChevronRight, Layers, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { BeforeAfterCase, beforeAfterCases } from '../data/beforeAfter';
import { buildWhatsAppUrl, WHATSAPP_EMOJIS } from '../data/business';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { trackEvent, trackWhatsAppConversion } from '../utils/analytics';

interface BeforeAfterSliderProps {
  cases?: BeforeAfterCase[];
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  cases = beforeAfterCases,
}) => {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // Porcentagem vertical de 0 a 100 (topo para base)
  const [isDragging, setIsDragging] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [beforeLoaded, setBeforeLoaded] = useState(false);
  const [afterLoaded, setAfterLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const beforeImgRef = useRef<HTMLImageElement>(null);
  const afterImgRef = useRef<HTMLImageElement>(null);

  const activeCase = cases.length > 0 ? cases[activeCaseIndex] : null;

  // Verifica se as imagens já estão em cache no mount ou na troca de caso
  useEffect(() => {
    if (beforeImgRef.current?.complete) {
      setBeforeLoaded(true);
    }
    if (afterImgRef.current?.complete) {
      setAfterLoaded(true);
    }
  }, [activeCaseIndex]);

  // Redefine a posição do divisor e o estado de carregamento ao trocar de caso
  const handleCaseSelect = (index: number) => {
    setActiveCaseIndex(index);
    setSliderPosition(50);
    setBeforeLoaded(false);
    setAfterLoaded(false);
  };

  // Cálculo da posição vertical (Y) a partir de coordenadas de ponteiro
  const updateSliderPosition = useCallback((clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (y / rect.height) * 100));
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setHasUserInteracted(true);
    updateSliderPosition(e.clientY);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const rafRef = useRef<number | null>(null);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateSliderPosition(e.clientY);
      });
    },
    [isDragging, updateSliderPosition]
  );

  const handlePointerUp = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (isDragging) {
      setIsDragging(false);
      trackEvent('slider_interact', {
        case_id: activeCase?.id || 'none',
        position: Math.round(sliderPosition),
      });
    }
  }, [isDragging, activeCase, sliderPosition]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Acessibilidade via teclado para o divisor slider
  const handleKeyDown = (e: React.KeyboardEvent) => {
    setHasUserInteracted(true);
    let newPos = sliderPosition;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      newPos = Math.max(0, sliderPosition - 2);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      newPos = Math.min(100, sliderPosition + 2);
    } else if (e.key === 'Home') {
      newPos = 0;
    } else if (e.key === 'End') {
      newPos = 100;
    } else if (e.key === 'PageDown') {
      newPos = Math.max(0, sliderPosition - 10);
    } else if (e.key === 'PageUp') {
      newPos = Math.min(100, sliderPosition + 10);
    } else {
      return;
    }
    e.preventDefault();
    setSliderPosition(newPos);
  };

  const whatsappUrl = buildWhatsAppUrl({
    originSection: 'antes-depois',
    customText: activeCase
      ? [
          `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}`,
          '',
          `Vi o caso de *${activeCase.title}* (${activeCase.vehicle}) no site e gostaria de solicitar um orçamento para o meu carro.`,
          '',
          `Podem me orientar, por favor? ${WHATSAPP_EMOJIS.smile}`,
        ].join('\n')
      : [
          `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}`,
          '',
          'Vim pelo site e gostaria de ver fotos e exemplos de reparos recentes semelhantes ao do meu veículo.',
          '',
          `Poderiam me enviar, por favor? ${WHATSAPP_EMOJIS.smile}`,
        ].join('\n'),
  });

  return (
    <section
      id="antes-e-depois"
      aria-labelledby="before-after-title"
      className="py-20 md:py-28 bg-[#121212] border-b border-[#2C2C2C] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-3 block">
            Comparador Visual
          </span>
          <h2
            id="before-after-title"
            className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase text-[#F5F5F5] tracking-tight mb-4"
          >
            Antes e Depois: A Excelência do Acabamento
          </h2>
          <p className="text-base text-[#A3A3A3] leading-relaxed">
            Arraste a linha divisória verticalmente (para cima e para baixo) para inspecionar a precisão de alinhamento, correção de chapa e acabamento da pintura automotiva realizada na Garagem Mailasque.
          </p>
        </div>

        {/* Cenário A: Existem Casos Autênticos Configurados */}
        {activeCase ? (
          <div className="max-w-5xl mx-auto">
            {/* Seletor de Casos (se houver mais de um) */}
            {cases.length > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6" role="tablist" aria-label="Seletor de casos de antes e depois">
                {cases.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === activeCaseIndex}
                    onClick={() => handleCaseSelect(idx)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-[#F97316] ${
                      idx === activeCaseIndex
                        ? 'bg-[#F97316] text-[#0A0A0A] shadow-md shadow-[#F97316]/20'
                        : 'bg-[#1E1E1E] text-[#A3A3A3] hover:text-white hover:bg-[#282828] border border-[#2C2C2C]'
                    }`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            )}

            {/* Container do Slider de Comparação com Proporção Panorâmica Tradicional e Deslize Vertical */}
            <div className="rounded-3xl border border-[#2C2C2C] bg-[#171717] p-3 sm:p-5 shadow-2xl">
              <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                className="relative overflow-hidden rounded-2xl aspect-[16/10] sm:aspect-[16/9] select-none touch-none cursor-ns-resize bg-[#0E0E0E]"
              >
                {/* Indicador de carregamento suave com fade out */}
                {(!beforeLoaded || !afterLoaded) && (
                  <div
                    className="absolute inset-0 z-30 flex items-center justify-center bg-[#0E0E0E] transition-opacity duration-500 pointer-events-none"
                    aria-hidden="true"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-2 border-[#F97316] border-t-transparent animate-spin" />
                      <span className="text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider">
                        Carregando imagens...
                      </span>
                    </div>
                  </div>
                )}

                {/* Imagem "DEPOIS" (Fundo Completo - Revelada na Parte Inferior) com fade-in suave de 500ms */}
                <img
                  ref={afterImgRef}
                  src={activeCase.afterImage}
                  alt={activeCase.afterAlt}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onLoad={() => setAfterLoaded(true)}
                  className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-500 ease-out ${
                    afterLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Imagem "ANTES" (Sobreposta no Topo com clipPath vertical de cima para baixo) com fade-in suave de 500ms */}
                <div
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{
                    clipPath: `inset(0 0 ${100 - sliderPosition}% 0)`,
                    WebkitClipPath: `inset(0 0 ${100 - sliderPosition}% 0)`,
                  }}
                >
                  <img
                    ref={beforeImgRef}
                    src={activeCase.beforeImage}
                    alt={activeCase.beforeAlt}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onLoad={() => setBeforeLoaded(true)}
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-out ${
                      beforeLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>

                {/* Etiquetas Fixas de Identificação "Antes" (Topo) e "Depois" (Base) com fade-out dinâmico */}
                <span
                  className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-10 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md bg-black/80 backdrop-blur-sm border border-white/20 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider pointer-events-none shadow-md transition-all duration-300 ${
                    sliderPosition < 15
                      ? 'opacity-0 scale-90 -translate-y-2 pointer-events-none'
                      : 'opacity-100 scale-100 translate-y-0'
                  }`}
                >
                  Antes (Topo)
                </span>
                <span
                  className={`absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md bg-[#F97316]/95 backdrop-blur-sm border border-black/20 text-[#0A0A0A] font-bold text-[10px] sm:text-xs uppercase tracking-wider pointer-events-none shadow-md transition-all duration-300 ${
                    sliderPosition > 85
                      ? 'opacity-0 scale-90 translate-y-2 pointer-events-none'
                      : 'opacity-100 scale-100 translate-y-0'
                  }`}
                >
                  Depois (Base)
                </span>

                {/* Divisor Horizontal Arrastável com Linha, Dica Visual e Manopla Central */}
                <div
                  className="absolute left-0 right-0 z-20 pointer-events-none"
                  style={{ top: `${sliderPosition}%`, transform: 'translateY(-50%)' }}
                >
                  {/* Linha horizontal com realce luminoso */}
                  <div className="h-0.5 w-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)] relative">
                    {!hasUserInteracted && (
                      <div className="absolute inset-0 bg-[#F97316] opacity-75 blur-[1px] animate-pulse" />
                    )}
                  </div>

                  {/* Dica visual animada de 'Arraste' para dispositivos móveis e desktop */}
                  {!hasUserInteracted && !isDragging && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 -top-10 sm:-top-11 pointer-events-none z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F97316] text-[#0A0A0A] font-extrabold text-[10px] sm:text-xs tracking-wider uppercase shadow-[0_4px_16px_rgba(0,0,0,0.8)] border border-black/30 animate-bounce whitespace-nowrap"
                      aria-hidden="true"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Arraste para comparar</span>
                    </div>
                  )}

                  {/* Manopla interativa acessível com papel de slider vertical */}
                  <div className="relative pointer-events-auto">
                    {/* Efeito de aura pulsante convidando ao toque em mobile */}
                    {!hasUserInteracted && !isDragging && (
                      <span
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F97316]/50 animate-ping pointer-events-none"
                        aria-hidden="true"
                      />
                    )}

                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Controle vertical do comparador antes e depois"
                      aria-orientation="vertical"
                      aria-valuenow={Math.round(sliderPosition)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      onKeyDown={handleKeyDown}
                      className="pointer-events-auto absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-[#0A0A0A] shadow-[0_4px_16px_rgba(0,0,0,0.6)] border-2 border-[#F97316] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#F97316] cursor-grab active:cursor-grabbing"
                    >
                      <ArrowUpDown className="w-4 h-4 text-[#0A0A0A]" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações do Caso Ativo e CTA */}
              <div className="mt-5 p-4 sm:p-6 rounded-2xl bg-[#121212] border border-[#2C2C2C] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#F97316] uppercase tracking-wider">
                      {activeCase.serviceCategory}
                    </span>
                    <span className="text-xs text-[#737373]">·</span>
                    <span className="text-xs text-[#A3A3A3] font-medium">
                      {activeCase.vehicle}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#F5F5F5]">
                    {activeCase.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1 max-w-2xl leading-relaxed">
                    {activeCase.description}
                  </p>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('whatsapp_click', { section: 'before-after-cta' })}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] font-extrabold text-xs sm:text-sm tracking-wide transition-all duration-150 shrink-0 shadow-lg hover:shadow-[#F97316]/20 focus-visible:outline-2 focus-visible:outline-[#F97316] self-center md:self-auto"
                >
                  <WhatsAppIcon className="w-4 h-4 shrink-0 fill-current" />
                  <span>Cotação para o seu carro</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Cenário B: Casos em Atualização (Preservação rigorosa da integridade fotográfica) */
          <div className="max-w-4xl mx-auto rounded-3xl border border-[#2C2C2C] bg-[#171717] p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316] flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Layers className="w-7 h-7" aria-hidden="true" />
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-[#F5F5F5] mb-3">
              Galeria de Casos Reais em Atualização
            </h3>

            <p className="text-sm sm:text-base text-[#A3A3A3] max-w-2xl mx-auto leading-relaxed mb-6">
              Na Garagem Mailasque, prezamos pela transparência: exibimos exclusivamente fotos autênticas dos veículos consertados em nossa oficina. Nosso catálogo interativo de Antes e Depois está sendo atualizado com as restaurações mais recentes concluídas na nossa câmara de pintura.
            </p>

            {/* Destaque das etapas de qualidade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left max-w-2xl mx-auto">
              <div className="p-3.5 rounded-xl bg-[#121212] border border-[#2C2C2C]">
                <span className="text-[11px] font-bold text-[#F97316] uppercase block mb-1">
                  1. Diagnóstico do Dano
                </span>
                <p className="text-xs text-[#A3A3A3]">
                  Avaliação da chapa e alinhamento milimétrico na funilaria.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#121212] border border-[#2C2C2C]">
                <span className="text-[11px] font-bold text-[#F97316] uppercase block mb-1">
                  2. Câmara de Pintura
                </span>
                <p className="text-xs text-[#A3A3A3]">
                  Pintura automotiva em estufa própria com acerto de cor original.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#121212] border border-[#2C2C2C]">
                <span className="text-[11px] font-bold text-[#F97316] uppercase block mb-1">
                  3. Polimento e Entrega
                </span>
                <p className="text-xs text-[#A3A3A3]">
                  Acabamento impecável e inspeção final de qualidade.
                </p>
              </div>
            </div>

            {/* CTAs de ação: Falar no WhatsApp ou Ver Vídeos da Oficina */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppConversion('before-after-waiting-whatsapp')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-[#0E2C1B] font-extrabold text-sm tracking-wide transition-all shadow-lg hover:shadow-[#25D366]/20 focus-visible:outline-2 focus-visible:outline-[#25D366]"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current" />
                <span>Solicitar fotos de casos no WhatsApp</span>
              </a>

              <a
                href="#galeria"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1E1E1E] hover:bg-[#262626] text-[#F5F5F5] border border-[#2C2C2C] hover:border-[#C9CDD2]/40 font-bold text-sm tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
              >
                <span>Ver vídeos reais da oficina na galeria</span>
                <ChevronRight className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BeforeAfterSlider;
