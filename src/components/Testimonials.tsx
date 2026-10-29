import React, { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, ExternalLink, Quote, RotateCw } from 'lucide-react';
import { testimonials, Testimonial } from '../data/testimonials';
import { businessData } from '../data/business';
import { trackEvent } from '../utils/analytics';

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDirection, setSpinDirection] = useState<1 | -1>(1);
  const [spinCardSlot, setSpinCardSlot] = useState<number | null>(null);
  const [spinTriggerId, setSpinTriggerId] = useState(0);

  const shouldReduceMotion = useReducedMotion();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Executa o giro 3D e avança para o próximo depoimento
  const triggerSpinAndAdvance = (direction: 1 | -1 = 1, clickedSlot: number = 0) => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSpinDirection(direction);
    setSpinCardSlot(clickedSlot);
    setSpinTriggerId((prev) => prev + 1);

    trackEvent('testimonial_spin', {
      from_index: currentIndex,
      direction: direction === 1 ? 'next' : 'prev',
    });

    // Na metade exata do giro (180°), o conteúdo do card é atualizado
    const halfDuration = shouldReduceMotion ? 50 : 280;
    const fullDuration = shouldReduceMotion ? 100 : 600;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => {
        if (direction === 1) {
          return (prev + 1) % testimonials.length;
        } else {
          return (prev - 1 + testimonials.length) % testimonials.length;
        }
      });
    }, halfDuration);

    setTimeout(() => {
      setIsSpinning(false);
      setSpinCardSlot(null);
    }, fullDuration);
  };

  const handlePrev = () => {
    triggerSpinAndAdvance(-1, 0);
  };

  const handleNext = () => {
    triggerSpinAndAdvance(1, 0);
  };

  const handleCardClick = (slotIndex: number) => {
    triggerSpinAndAdvance(1, slotIndex);
  };

  const handleDotClick = (targetIndex: number) => {
    if (isSpinning || targetIndex === currentIndex) return;
    const dir = targetIndex > currentIndex ? 1 : -1;
    setIsSpinning(true);
    setSpinDirection(dir);
    setSpinCardSlot(0);
    setSpinTriggerId((prev) => prev + 1);

    const halfDuration = shouldReduceMotion ? 50 : 280;
    setTimeout(() => {
      setCurrentIndex(targetIndex);
    }, halfDuration);

    setTimeout(() => {
      setIsSpinning(false);
      setSpinCardSlot(null);
    }, 600);
  };

  const handleAllReviewsClick = () => {
    trackEvent('maps_click', { section: 'testimonials-all-reviews' });
  };

  // Prepara as 3 posições visíveis ordenadas circularmente
  const visibleCards: { item: Testimonial; slotIndex: number }[] = [
    { item: testimonials[currentIndex % testimonials.length], slotIndex: 0 },
    { item: testimonials[(currentIndex + 1) % testimonials.length], slotIndex: 1 },
    { item: testimonials[(currentIndex + 2) % testimonials.length], slotIndex: 2 },
  ];

  return (
    <section
      id="avaliacoes"
      aria-labelledby="testimonials-title"
      className="py-20 md:py-28 bg-[#121212] border-b border-[#2C2C2C] relative overflow-hidden"
    >
      {/* Âncora alternativa para #depoimentos */}
      <div id="depoimentos" className="sr-only" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho com Prova Social Google 4,9 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F97316] mb-3">
              <Star className="w-4 h-4 fill-current text-[#F59E0B]" aria-hidden="true" />
              <span>Avaliações Reais de Clientes</span>
            </div>
            <h2
              id="testimonials-title"
              className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase text-[#F5F5F5] tracking-tight"
            >
              Nota {businessData.rating.scoreFormatted} no Google · {businessData.rating.totalReviews} avaliações
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={businessData.social.googleReview}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleAllReviewsClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1C1C] hover:bg-[#262626] border border-[#2C2C2C] hover:border-[#C9CDD2]/30 text-xs sm:text-sm font-semibold text-[#F5F5F5] transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
            >
              <span>Ver todas as avaliações no Google</span>
              <ExternalLink className="w-4 h-4 text-[#A3A3A3]" aria-hidden="true" />
            </a>

            {/* Controles de Navegação do Carrossel com Giro */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={isSpinning}
                className="p-2.5 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-[#F5F5F5] hover:bg-[#F97316] hover:text-[#0A0A0A] disabled:opacity-40 transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
                aria-label="Girar para o depoimento anterior"
                title="Girar para o depoimento anterior"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isSpinning}
                className="p-2.5 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-[#F5F5F5] hover:bg-[#F97316] hover:text-[#0A0A0A] disabled:opacity-40 transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
                aria-label="Girar para o próximo depoimento"
                title="Girar para o próximo depoimento"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Mensagem instrucional convidativa e contador responsivo */}
        <div className="flex items-center justify-between gap-3 text-xs text-[#A3A3A3] mb-4 px-1">
          <div className="flex items-center gap-2 font-medium min-w-0">
            <RotateCw className="w-3.5 h-3.5 text-[#F97316] shrink-0" aria-hidden="true" />
            <span className="leading-snug text-neutral-300">
              <span className="sm:hidden">Toque no card para girar e ver o próximo</span>
              <span className="hidden sm:inline">Toque ou clique em qualquer card para girar e ver o próximo depoimento</span>
            </span>
          </div>
          <span className="tabular-nums font-bold text-[#F97316] shrink-0 whitespace-nowrap bg-[#1C1C1C] px-2.5 py-1 rounded-lg border border-[#2C2C2C] text-[11px] sm:text-xs tracking-wide shadow-sm">
            {currentIndex + 1} de {testimonials.length}
          </span>
        </div>

        {/* Grade / Carrossel com Efeito de Giro 3D */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="region"
          aria-label="Carrossel animado de avaliações do Google"
          style={{ perspective: '1200px' }}
        >
          {visibleCards.map(({ item, slotIndex }, displayPosition) => {
            // Em telas mobile exibe apenas o 1º slot, no tablet 2 slots, no desktop 3 slots
            const isHiddenMobile = displayPosition > 0 ? 'hidden md:flex' : 'flex';
            const isHiddenTablet = displayPosition > 1 ? 'hidden lg:flex' : isHiddenMobile;

            const isThisCardSpinning = isSpinning && (spinCardSlot === null || spinCardSlot === slotIndex);

            return (
              <motion.div
                key={`${slotIndex}-${spinTriggerId}`}
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(slotIndex)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(slotIndex);
                  }
                }}
                animate={
                  isThisCardSpinning
                    ? shouldReduceMotion
                      ? { opacity: [1, 0.4, 1], scale: [1, 0.98, 1] }
                      : {
                          rotateY: spinDirection === 1 ? [0, 180, 360] : [0, -180, -360],
                          scale: [1, 1.05, 0.98, 1],
                          boxShadow: [
                            '0 4px 14px rgba(0,0,0,0.5)',
                            '0 20px 40px rgba(249,115,22,0.3)',
                            '0 4px 14px rgba(0,0,0,0.5)',
                          ],
                        }
                    : { rotateY: 0, scale: 1 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0.2 : 0.6,
                  ease: [0.34, 1.3, 0.64, 1],
                }}
                style={{ transformStyle: 'preserve-3d' }}
                className={`relative rounded-2xl bg-[#171717] hover:bg-[#1C1C1C] border border-[#2C2C2C] hover:border-[#F97316] p-6 sm:p-7 flex-col justify-between shadow-xl cursor-pointer select-none group transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[#F97316] ${isHiddenTablet}`}
                aria-label={`Depoimento de ${item.author}. Clique para girar e ver o próximo.`}
              >
                <div>
                  {/* Topo do Card: Estrelas + Selo com Ícone de Giro */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-0.5 text-[#F59E0B]" aria-label="Nota 5 de 5 estrelas">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" aria-hidden="true" />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-wider bg-[#F97316]/10 px-2 py-0.5 rounded-full border border-[#F97316]/20 flex items-center gap-1 group-hover:bg-[#F97316] group-hover:text-[#0A0A0A] transition-colors">
                        <RotateCw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" aria-hidden="true" />
                        <span>Girar card</span>
                      </span>
                    </div>
                  </div>

                  {/* Texto do Depoimento com Aspas Decorativas */}
                  <div className="relative mb-6">
                    <Quote className="w-8 h-8 text-[#2C2C2C] absolute -top-2 -left-2 -z-0 opacity-40 group-hover:text-[#F97316]/20 transition-colors" aria-hidden="true" />
                    <p className="text-sm text-[#F5F5F5] leading-relaxed relative z-10 italic">
                      "{item.quote}"
                    </p>
                  </div>
                </div>

                {/* Rodapé do Card: Autor + Selo Verificado Google */}
                <div className="pt-4 border-t border-[#2C2C2C] flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-[#F5F5F5] block">{item.author}</span>
                    <span className="text-[11px] text-[#737373]">{item.source}</span>
                  </div>
                  <span className="text-[11px] text-[#C9CDD2] flex items-center gap-1 font-medium bg-[#222222] px-2.5 py-0.5 rounded-full border border-[#333333]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" aria-hidden="true" />
                    <span>Depoimento</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Indicadores de Paginação em Dots & Controles Mobile */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-[#222222]">
          {/* Dots interativos (clique também gira e navega) */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Pontos de navegação das avaliações">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={idx === currentIndex}
                onClick={() => handleDotClick(idx)}
                className={`transition-all rounded-full focus-visible:outline-2 focus-visible:outline-[#F97316] ${
                  idx === currentIndex
                    ? 'w-7 h-2.5 bg-[#F97316] shadow-sm shadow-[#F97316]/50'
                    : 'w-2.5 h-2.5 bg-[#2C2C2C] hover:bg-[#525252]'
                }`}
                aria-label={`Ir para avaliação ${idx + 1}`}
              />
            ))}
          </div>

          {/* Botões de Navegação Mobile */}
          <div className="flex sm:hidden items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSpinning}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-[#F5F5F5] hover:bg-[#F97316] hover:text-[#0A0A0A] text-xs font-bold transition-colors"
              aria-label="Girar para depoimento anterior"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isSpinning}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-[#0A0A0A] font-bold text-xs hover:bg-[#EA580C] transition-colors shadow-md shadow-[#F97316]/20"
              aria-label="Girar para próximo depoimento"
            >
              <span>Girar Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
