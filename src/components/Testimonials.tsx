import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, ExternalLink, Quote } from 'lucide-react';
import { testimonials } from '../data/testimonials';
import { businessData } from '../data/business';
import { trackEvent } from '../utils/analytics';

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0));
  };

  const handleAllReviewsClick = () => {
    trackEvent('maps_click', { section: 'testimonials-all-reviews' });
  };

  return (
    <section
      id="avaliacoes"
      aria-labelledby="testimonials-title"
      className="py-20 md:py-28 bg-[#121212] border-b border-[#2C2C2C] relative"
    >
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

          <div className="flex items-center gap-4">
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

            {/* Controles de Navegação do Carrossel (sem rotação automática) */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="p-2.5 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-[#F5F5F5] hover:bg-[#F97316] hover:text-[#0A0A0A] transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
                aria-label="Depoimento anterior"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-2.5 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-[#F5F5F5] hover:bg-[#F97316] hover:text-[#0A0A0A] transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
                aria-label="Próximo depoimento"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Grade / Carrossel dos 6 depoimentos */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="region"
          aria-label="Lista de avaliações do Google"
        >
          {testimonials.map((item, idx) => {
            const isFeatured = idx === currentIndex;
            return (
              <div
                key={item.id}
                className={`relative rounded-2xl bg-[#171717] border p-6 flex flex-col justify-between transition-all duration-200 shadow-md ${
                  isFeatured
                    ? 'border-[#F97316]/50 bg-[#1C1C1C]'
                    : 'border-[#2C2C2C] hover:border-[#383838]'
                }`}
              >
                <div>
                  {/* Topo do Card: Estrelas + Etiqueta Google */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-0.5 text-[#F59E0B]" aria-label="Nota 5 de 5 estrelas">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" aria-hidden="true" />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider">
                      {item.source}
                    </span>
                  </div>

                  {/* Texto do Depoimento Exato (sem edição) */}
                  <div className="relative mb-6">
                    <Quote className="w-8 h-8 text-[#2C2C2C] absolute -top-2 -left-2 -z-0 opacity-50" aria-hidden="true" />
                    <p className="text-sm text-[#F5F5F5] leading-relaxed relative z-10 italic">
                      "{item.quote}"
                    </p>
                  </div>
                </div>

                {/* Autor */}
                <div className="pt-4 border-t border-[#2C2C2C] flex items-center justify-between">
                  <span className="text-sm font-bold text-[#F5F5F5]">{item.author}</span>
                  <span className="text-xs text-[#22C55E] flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" aria-hidden="true" />
                    <span>Verificado</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Paginação Mobile */}
        <div className="flex sm:hidden justify-center items-center gap-4 mt-8">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2.5 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-[#F5F5F5] hover:bg-[#F97316] hover:text-[#0A0A0A] transition-colors"
            aria-label="Depoimento anterior"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <span className="text-xs text-[#737373]">
            {currentIndex + 1} de {testimonials.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="p-2.5 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-[#F5F5F5] hover:bg-[#F97316] hover:text-[#0A0A0A] transition-colors"
            aria-label="Próximo depoimento"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};
