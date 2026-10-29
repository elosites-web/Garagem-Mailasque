import React from 'react';
import { ShieldCheck, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { businessData, buildWhatsAppUrl } from '../data/business';
import { trackWhatsAppConversion } from '../utils/analytics';

export const Insurers: React.FC = () => {
  const handleInsuranceWhatsAppClick = () => {
    trackWhatsAppConversion('insurers');
  };

  return (
    <section
      id="seguradoras"
      aria-labelledby="insurers-title"
      className="py-16 md:py-20 bg-[#0E0E0E] border-b border-[#2C2C2C] relative overflow-hidden"
    >
      {/* Âncora alternativa para #sinistro */}
      <div id="sinistro" className="sr-only" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#171717] to-[#121212] border border-[#2C2C2C] p-8 md:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Texto explicativo dos direitos do segurado */}
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F97316] mb-3">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>Atendimento a Todas as Seguradoras</span>
              </div>

              <h2
                id="insurers-title"
                className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-[#F5F5F5] tracking-tight mb-4"
              >
                {businessData.insurers.message}
              </h2>

              <p className="text-base text-[#A3A3A3] leading-relaxed mb-6">
                {businessData.insurers.rightText}
              </p>

              {/* Lista de pontos-chave */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-[#F5F5F5] mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#F97316] shrink-0" aria-hidden="true" />
                  <span>Você escolhe a oficina</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#F97316] shrink-0" aria-hidden="true" />
                  <span>Laudo e vistoria direta</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#F97316] shrink-0" aria-hidden="true" />
                  <span>Auxílio em todo o trâmite</span>
                </div>
              </div>
            </div>

            {/* Coluna de Ação Direta para Sinistro */}
            <div className="lg:col-span-4 flex flex-col justify-center items-center">
              <div className="w-full sm:w-auto bg-[#1F1F1F] border border-[#2C2C2C] p-6 rounded-2xl flex flex-col gap-4 text-left mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F97316]/10 border border-[#F97316]/30 flex items-center justify-center text-[#F97316]">
                    <FileText className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F5F5F5]">Acionou o seguro?</h3>
                    <p className="text-xs text-[#A3A3A3]">Nós orientamos cada passo</p>
                  </div>
                </div>

                <a
                  href={buildWhatsAppUrl({
                    originSection: 'site-seguradoras',
                    customText: 'Olá, Garagem Mailasque! Fiz sinistro pelo seguro, como funciona para consertar meu carro com vocês?',
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleInsuranceWhatsAppClick}
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] font-bold text-sm transition-all duration-150 shadow-md focus-visible:outline-2 focus-visible:outline-[#F97316]"
                >
                  <WhatsAppIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Fiz sinistro, como funciona?</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </a>

                <a
                  href="#orcamento"
                  className="text-xs text-center text-[#A3A3A3] hover:text-[#F97316] underline transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
                >
                  Ou envie os dados do carro pelo formulário
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
