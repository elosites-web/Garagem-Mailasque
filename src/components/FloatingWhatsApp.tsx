import React from 'react';
import { MessageSquare } from 'lucide-react';
import { buildWhatsAppUrl } from '../data/business';
import { trackEvent } from '../utils/analytics';

export const FloatingWhatsApp: React.FC = () => {
  const handleClick = () => {
    trackEvent('whatsapp_click', { section: 'floating-button' });
  };

  const whatsappUrl = buildWhatsAppUrl({
    originSection: 'site-flutuante',
    customText: 'Olá, Garagem Mailasque! Vim pelo botão do site e gostaria de tirar uma dúvida sobre funilaria e pintura.',
  });

  return (
    <aside aria-label="Contato rápido pelo WhatsApp" className="fixed bottom-5 right-5 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-[#0A0A0A] font-bold text-sm shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
        aria-label="Falar com a Garagem Mailasque no WhatsApp"
      >
        {/* Única animação contínua sutil na página inteira (respeita a regra de ouro de no máx 1 animação contínua) */}
        <span
          className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none"
          style={{ animationDuration: '3.5s' }}
          aria-hidden="true"
        />

        <MessageSquare className="w-5 h-5 shrink-0 fill-current text-[#0A0A0A]" aria-hidden="true" />
        <span className="hidden sm:inline font-extrabold tracking-tight">
          Orçamento WhatsApp
        </span>
      </a>
    </aside>
  );
};
