import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { buildWhatsAppUrl, isWorkshopOpenNow } from '../data/business';
import { trackEvent } from '../utils/analytics';

export const FloatingWhatsApp: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [isOnline, setIsOnline] = React.useState<boolean>(() => isWorkshopOpenNow());

  React.useEffect(() => {
    setIsOnline(isWorkshopOpenNow());
    const timer = setInterval(() => {
      setIsOnline(isWorkshopOpenNow());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    trackEvent('whatsapp_click', { section: 'floating-button' });
  };

  const whatsappUrl = buildWhatsAppUrl({
    originSection: 'site-flutuante',
    customText: 'Olá, Garagem Mailasque! Vim pelo botão do site e gostaria de tirar uma dúvida sobre funilaria e pintura.',
  });

  return (
    <motion.aside
      aria-label="Contato rápido pelo WhatsApp"
      className="fixed bottom-5 right-5 z-40"
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.45,
        delay: shouldReduceMotion ? 0 : 0.35,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-[#0E2C1B] font-extrabold text-sm border border-white/30 hover:border-white ring-0 hover:ring-2 hover:ring-[#25D366]/60 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5),0_0_20px_2px_rgba(37,211,102,0.35)] hover:shadow-[0_16px_36px_-4px_rgba(0,0,0,0.65),0_0_34px_8px_rgba(37,211,102,0.7)] transition-all duration-200 ease-out hover:scale-110 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#0E2C1B]"
        aria-label="Falar com a Garagem Mailasque no WhatsApp"
      >
        {/* Tooltip / Indicador de status 'Online' exibido durante o expediente definido no JSON-LD */}
        {isOnline && (
          <span
            className="absolute -top-7 right-2 sm:right-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#111111]/95 border border-[#25D366]/40 text-[#25D366] text-[11px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.6)] pointer-events-none whitespace-nowrap transition-transform duration-200 group-hover:-translate-y-0.5 select-none"
            role="status"
            aria-label="Atendimento online agora no WhatsApp"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="motion-safe:animate-ping motion-reduce:hidden absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]" />
            </span>
            <span>Online</span>
            <span className="hidden sm:inline text-neutral-400 font-medium text-[10px]">· Agora</span>
          </span>
        )}

        {/* Animação de pulso contínua na borda a cada 5 segundos (respeitando prefers-reduced-motion) */}
        <span
          className="absolute -inset-0.5 rounded-full pointer-events-none animate-border-pulse-5s motion-reduce:hidden"
          aria-hidden="true"
        />

        {/* Ícone oficial do WhatsApp com brilho e nitidez elevados, atendendo estritamente ao WCAG AAA (7.6:1) */}
        <WhatsAppIcon className="w-5 h-5 shrink-0 fill-current text-[#0E2C1B] transition-transform duration-200 group-hover:scale-110" />
        <span className="hidden sm:inline font-black tracking-tight text-[#0E2C1B]">
          Orçamento WhatsApp
        </span>
      </a>
    </motion.aside>
  );
};

export default FloatingWhatsApp;
