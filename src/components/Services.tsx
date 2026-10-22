import React from 'react';
import { Hammer, PaintBucket, Wrench, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { motion, useReducedMotion } from 'motion/react';
import { services, ServiceItem } from '../data/services';
import { buildWhatsAppUrl } from '../data/business';
import { trackEvent } from '../utils/analytics';

const iconMap = {
  Hammer: Hammer,
  PaintBucket: PaintBucket,
  Wrench: Wrench,
  ShieldCheck: ShieldCheck,
};

export const Services: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const handleServiceClick = (serviceName: string) => {
    trackEvent('whatsapp_click', { section: 'services', service: serviceName });
  };

  return (
    <section
      id="servicos"
      aria-labelledby="services-title"
      className="py-20 md:py-28 bg-[#121212] border-b border-[#2C2C2C] relative"
    >
      {/* Âncora alternativa para #servicos-oficina */}
      <div id="servicos-oficina" className="sr-only" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-3 block">
            Nossas Especialidades
          </span>
          <h2
            id="services-title"
            className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase text-[#F5F5F5] tracking-tight mb-4"
          >
            Serviços automotivos de precisão e acabamento impecável
          </h2>
          <p className="text-base text-[#A3A3A3] leading-relaxed">
            Atuamos exclusivamente nos serviços em que somos especialistas, com processos técnicos rigorosos e ferramentas adequadas para cada reparo.
          </p>
        </div>

        {/* Grid dos 4 Serviços com animação fade-in up */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service: ServiceItem, index) => {
            const IconComponent = iconMap[service.iconName];
            return (
              <motion.div
                key={service.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.5,
                  delay: shouldReduceMotion ? 0 : index * 0.1,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                className="group relative rounded-2xl bg-[#171717] border border-[#2C2C2C] p-6 flex flex-col justify-between hover:border-[#F97316]/50 hover:bg-[#1C1C1C] transition-colors duration-200 shadow-lg"
              >
                <div>
                  {/* Cabeçalho do Card: Ícone e Índice Editorial */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#222222] border border-[#2C2C2C] flex items-center justify-center text-[#F97316] group-hover:bg-[#F97316] group-hover:text-[#0A0A0A] transition-colors duration-200">
                      <IconComponent className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <span className="font-display text-lg font-bold text-[#525252] group-hover:text-[#A3A3A3] transition-colors">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Nome do Serviço */}
                  <h3 className="font-display text-2xl font-bold uppercase text-[#F5F5F5] tracking-tight mb-3">
                    {service.name}
                  </h3>

                  {/* Descrição em 1-2 linhas (sem promessas de prazo) */}
                  <p className="text-sm text-[#A3A3A3] leading-relaxed mb-6">
                    {service.shortDescription}
                  </p>

                  {/* Pontos de Destaque */}
                  <ul className="space-y-2 mb-8 text-xs text-[#C9CDD2]" aria-label={`Diferenciais de ${service.name}`}>
                    {service.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" aria-hidden="true" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botão de WhatsApp Específico para o Serviço */}
                <a
                  href={buildWhatsAppUrl({
                    originSection: `site-servico-${service.id}`,
                    service: service.name,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleServiceClick(service.name)}
                  className="w-full inline-flex items-center justify-between px-4 py-3 rounded-lg bg-[#222222] hover:bg-[#F97316] text-[#F5F5F5] hover:text-[#0A0A0A] border border-[#2C2C2C] hover:border-[#F97316] font-bold text-xs uppercase tracking-wider transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#F97316]"
                >
                  <span className="flex items-center gap-2">
                    <WhatsAppIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Orçar {service.name}</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </a>
              </motion.div>
            );
          })}
        </div>

        {/* Nota de rodapé da seção */}
        <div className="mt-12 text-center text-xs text-[#737373]">
          Não realizamos serviços avulsos de estética, polimento simples ou lava-rápido. Foco total em reparação e pintura de alta qualidade.
        </div>
      </div>
    </section>
  );
};
