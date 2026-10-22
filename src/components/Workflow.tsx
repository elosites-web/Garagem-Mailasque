import React from 'react';
import { Camera, CheckSquare, Wrench, Sparkles } from 'lucide-react';

export const Workflow: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Orçamento com fotos',
      description: 'Envie as fotos do veículo pelo WhatsApp. Analisamos os danos com agilidade para propor a melhor solução.',
      icon: Camera,
    },
    {
      number: '02',
      title: 'Aprovação transparente',
      description: 'Apresentamos de forma clara as etapas necessárias, peças a recuperar ou substituir e condições de pagamento.',
      icon: CheckSquare,
    },
    {
      number: '03',
      title: 'Execução cuidadosa',
      description: 'Seu carro passa pela funilaria técnica e câmara de pintura com controle de pureza e temperatura.',
      icon: Wrench,
    },
    {
      number: '04',
      title: 'Entrega impecável',
      description: 'Revisão criteriosa de alinhamento, tonalidade e brilho para devolver ao seu carro a aparência de zero km.',
      icon: Sparkles,
    },
  ];

  return (
    <section
      id="como-funciona"
      aria-labelledby="workflow-title"
      className="py-20 md:py-28 bg-[#171717] border-b border-[#2C2C2C] relative"
    >
      {/* Âncora alternativa para #processo */}
      <div id="processo" className="sr-only" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-3 block">
            Como Funciona
          </span>
          <h2
            id="workflow-title"
            className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase text-[#F5F5F5] tracking-tight mb-4"
          >
            Transparência, cuidado e agilidade do início ao fim
          </h2>
          <p className="text-base text-[#A3A3A3] leading-relaxed">
            Um processo organizado para você acompanhar cada etapa do reparo sem surpresas e com total clareza.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-2xl bg-[#1F1F1F] border border-[#2C2C2C] p-6 flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-display text-2xl font-extrabold text-[#F97316]">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-[#171717] border border-[#2C2C2C] flex items-center justify-center text-[#A3A3A3]">
                      <IconComponent className="w-5 h-5" aria-hidden="true" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#F5F5F5] mb-2">
                    {step.title}
                  </h3>

                  <p className="text-sm text-[#A3A3A3] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
