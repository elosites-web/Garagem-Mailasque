import React from 'react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { businessData, buildWhatsAppUrl, WHATSAPP_TEMPLATES } from '../data/business';
import { trackWhatsAppConversion } from '../utils/analytics';

export const PartnerApvs: React.FC = () => {
  const handlePartnerClick = () => {
    trackWhatsAppConversion('partner-apvs');
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
        <div className="rounded-3xl bg-[#171717] border border-[#2C2C2C] p-6 sm:p-10 shadow-xl overflow-hidden card-hover-elevation">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Imagem Oficial da Parceria */}
            <div className="md:col-span-5 rounded-2xl overflow-hidden border border-[#2C2C2C] bg-[#0E0E0E]">
              <img
                src={businessData.partnershipApvs.imagePath}
                alt="Ponto de venda cadastrado APVS Brasil na Garagem Mailasque"
                width={600}
                height={400}
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover max-h-72"
              />
            </div>

            {/* Conteúdo Institucional Discreto */}
            <div className="md:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3 text-xs">
                <span className="font-bold uppercase tracking-wider text-[#A3A3A3]">
                  Parceria
                </span>
                <span aria-hidden="true" className="text-[#525252]">·</span>
                <span className="text-[#F97316] font-semibold">
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
                    customText: WHATSAPP_TEMPLATES.partnerApvs(),
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handlePartnerClick}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-[#F5F5F5] border border-[#2C2C2C] text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#F97316] shrink-0" aria-hidden="true" />
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
