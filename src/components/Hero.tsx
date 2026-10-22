import React from 'react';
import { MessageSquare, ArrowDown, Star, Shield, CheckCircle2 } from 'lucide-react';
import { businessData, buildWhatsAppUrl } from '../data/business';
import { trackEvent } from '../utils/analytics';

export const Hero: React.FC = () => {
  const handleCtaClick = () => {
    trackEvent('whatsapp_click', { section: 'hero' });
  };

  const handleGoogleReviewsClick = () => {
    trackEvent('maps_click', { section: 'hero-rating' });
  };

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden border-b border-[#2C2C2C]"
    >
      {/* Background Decorativo Metálico Sutil */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F97316]/20 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Coluna de Texto & Conversão (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Tag de Confiança / Prova Social Não-Pill */}
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-[#A3A3A3] mb-4">
              <span className="flex items-center gap-1.5 text-[#F5F5F5] font-semibold">
                <Shield className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
                <span>Atendemos todas as seguradoras</span>
              </span>
              <span aria-hidden="true" className="text-[#525252]">·</span>
              <span>Livre escolha da oficina</span>
              <span aria-hidden="true" className="text-[#525252]">·</span>
              <span className="text-[#C9CDD2]">Mailasqui, São Roque/SP</span>
            </div>

            {/* H1 Principal com Proposta de Valor */}
            <h1
              id="hero-title"
              className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-[#F5F5F5] leading-[1.05] mb-6 text-balance"
            >
              Funilaria e pintura automotiva para devolver ao seu carro a{' '}
              <span className="text-[#F97316] underline decoration-[#F97316]/40 underline-offset-4">
                aparência de zero km
              </span>
            </h1>

            {/* Subtítulo institucional fiel ao copy do cliente */}
            <p className="text-base sm:text-lg text-[#A3A3A3] leading-relaxed mb-8 max-w-2xl">
              Atendemos com transparência, cuidado e agilidade — do orçamento até a entrega final. 
              Estrutura própria com câmara de pintura pressurizada e acabamento impecável em cada detalhe.
            </p>

            {/* Ações de Conversão: CTA Primário + Secundário */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
              <a
                href={buildWhatsAppUrl({ originSection: 'site-hero' })}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCtaClick}
                className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] font-bold text-base md:text-lg tracking-wide transition-all duration-150 shadow-xl hover:shadow-[#F97316]/20 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-[#F97316]"
              >
                <MessageSquare className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Solicitar orçamento no WhatsApp</span>
              </a>

              <a
                href="#servicos"
                className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-[#171717] hover:bg-[#222222] text-[#F5F5F5] border border-[#2C2C2C] hover:border-[#C9CDD2]/30 font-semibold text-base transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#F97316]"
              >
                <span>Ver serviços</span>
                <ArrowDown className="w-4 h-4 text-[#A3A3A3]" aria-hidden="true" />
              </a>
            </div>

            {/* Prova Social Adjacente ao CTA (Google Maps 4.9 / 79 avaliações) */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#2C2C2C]/60 text-xs sm:text-sm text-[#A3A3A3]">
              <a
                href={businessData.social.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleGoogleReviewsClick}
                className="group inline-flex items-center gap-2 text-[#F5F5F5] hover:text-[#F97316] transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316] rounded-sm"
                title="Ver avaliações no Google Maps"
              >
                <div className="flex items-center gap-0.5 text-[#F59E0B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <span className="font-bold text-[#F5F5F5] group-hover:text-[#F97316]">
                  {businessData.rating.scoreFormatted} no Google
                </span>
                <span className="text-[#737373]">({businessData.rating.totalReviews} avaliações)</span>
              </a>

              <span aria-hidden="true" className="text-[#525252] hidden sm:inline">·</span>

              <div className="flex items-center gap-1.5 text-[#A3A3A3]">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
                <span>Parcelamento em até {businessData.payment.installments}</span>
              </div>
            </div>
          </div>

          {/* Coluna Visual (5 cols): Foto Real da Câmara de Pintura / Instalações */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#2C2C2C] bg-[#171717] shadow-2xl">
              <img
                src="/assets/garagemailasque/camara-de-pintura.jpeg"
                alt="Câmara de pintura automotiva pressurizada da Garagem Mailasque em São Roque"
                width={800}
                height={600}
                loading="eager"
                fetchPriority="high"
                className="w-full h-[380px] sm:h-[440px] lg:h-[480px] object-cover"
              />

              {/* Scrim de gradiente para contraste e legenda autêntica */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E]/90 via-[#0E0E0E]/20 to-transparent pointer-events-none"
                aria-hidden="true"
              />

              <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#F97316] block mb-1">
                  Infraestrutura Própria
                </span>
                <p className="text-sm font-semibold text-[#F5F5F5] leading-snug">
                  Câmara de pintura pressurizada para acabamento limpo e fidelidade de cor
                </p>
                <p className="text-xs text-[#A3A3A3] mt-0.5">
                  Rod. Raposo Tavares, Km 54,65 · Mailasqui
                </p>
              </div>
            </div>

            {/* Selo Flutuante Discreto de Ponto APVS */}
            <div className="hidden sm:flex absolute -top-4 -right-4 bg-[#1F1F1F] border border-[#2C2C2C] text-[#F5F5F5] rounded-xl px-4 py-2.5 shadow-xl items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" aria-hidden="true" />
              <div className="text-left">
                <div className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Parceria</div>
                <div className="text-xs font-bold text-[#F5F5F5]">Ponto de Venda APVS Brasil</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
