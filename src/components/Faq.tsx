import React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { faqItems } from '../data/faq';

export const Faq: React.FC = () => {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="py-20 md:py-28 bg-[#121212] border-b border-[#2C2C2C] relative"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F97316] mb-3">
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
            <span>Tire Suas Dúvidas</span>
          </div>
          <h2
            id="faq-title"
            className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase text-[#F5F5F5] tracking-tight mb-4"
          >
            Perguntas Frequentes
          </h2>
          <p className="text-base text-[#A3A3A3] max-w-xl mx-auto">
            Respostas claras para as principais dúvidas sobre atendimento, seguradoras e pagamento na Garagem Mailasque.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <details
              key={item.id}
              className="group rounded-2xl bg-[#171717] border border-[#2C2C2C] p-5 sm:p-6 transition-colors duration-150 open:bg-[#1A1A1A] open:border-[#383838]"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-base sm:text-lg text-[#F5F5F5] select-none focus-visible:outline-2 focus-visible:outline-[#F97316] rounded-sm">
                <span className="pr-4">{item.question}</span>
                <ChevronDown
                  className="w-5 h-5 text-[#A3A3A3] group-open:rotate-180 group-open:text-[#F97316] transition-transform duration-200 shrink-0"
                  aria-hidden="true"
                />
              </summary>
              <div className="pt-4 mt-3 border-t border-[#2C2C2C] text-sm text-[#A3A3A3] leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
