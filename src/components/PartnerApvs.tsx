import React from 'react';
import { ShieldCheck, MessageSquare } from 'lucide-react';
import { businessData, buildWhatsAppUrl } from '../data/business';
import { trackEvent } from '../utils/analytics';

export const PartnerApvs: React.FC = () => {
  const handlePartnerClick = () => {
    trackEvent('whatsapp_click', { section: 'partner-apvs' });
  };

  return (
    <section
      id="parceria-apvs"
      aria-labelledby="apvs-title"
      className="py-16 md:py-20 bg-[#121212] border-b border-[#2C2C2C] relative"
    >
      {/* Âncora alternativa para #apvs */}
      <div id="apvs" className="sr-only" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#171717] border border-[#2C2C2C] p-6 sm:p-10 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Imagem Oficial da Parceria */}
            <div className="md:col-span-5 rounded-2xl overflow-hidden border border-[#2C2C2C] bg-[#0E0E0E]">
              <img
                src={businessData.partnershipApvs.imagePath}
                alt="Ponto de venda cadastrado APVS Brasil na Garagem Mailasque"
                width={600}
                height={400}
                loading="lazy"
                className="w-full h-auto object-cover max-h-72"
              />
            </div>

            {/* Conteúdo Institucional Discreto */}
            <div className="md:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] bg-[#222222] px-2.5 py-1 rounded-md border border-[#2C2C2C]">
                  Parceria
                </span>
                <span className="text-xs text-[#F97316] font-semibold">
                  {businessData.partnershipApvs.badge}
                </span>
              </div>

              <h2
                id="apvs-title"
                className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-[#F5F5F5] tracking-tight mb-3"
              >
                {businessData.partnershipApvs.title}
              </h2>

              <p className="text-sm sm:text-base text-[#A3A3A3] leading-relaxed mb-6">
                {businessData.partnershipApvs.description}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a
                  href={buildWhatsAppUrl({
                    originSection: 'site-parceria-apvs',
                    customText: 'Olá, Garagem Mailasque! Gostaria de mais informações sobre o ponto de atendimento da APVS Brasil na oficina.',
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handlePartnerClick}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-[#F5F5F5] border border-[#2C2C2C] text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
                >
                  <MessageSquare className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
                  <span>Saber mais sobre a APVS na oficina</span>
                </a>

                <span className="text-xs text-[#737373]">
                  {businessData.partnershipApvs.disclaimer}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
