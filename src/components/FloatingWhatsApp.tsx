import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, Send, ArrowDownRight } from 'lucide-react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { businessData, buildWhatsAppUrl, isWorkshopOpenNow } from '../data/business';
import { trackEvent } from '../utils/analytics';

export const FloatingWhatsApp: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [isOnline, setIsOnline] = useState<boolean>(() => isWorkshopOpenNow());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  const bubbleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Monitora horário de atendimento a cada minuto
  useEffect(() => {
    setIsOnline(isWorkshopOpenNow());
    const interval = setInterval(() => {
      setIsOnline(isWorkshopOpenNow());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Formata hora local atual para a mensagem do chat
  useEffect(() => {
    try {
      const now = new Date();
      const timeFormatted = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
      });
      setCurrentTimeStr(timeFormatted);
    } catch {
      setCurrentTimeStr('Agora');
    }
  }, [isChatOpen]);

  // Agenda exibição da bolha proativa: 60s inicial, 90s após fechamento
  const scheduleBubble = (delayMs: number) => {
    if (bubbleTimerRef.current) {
      clearTimeout(bubbleTimerRef.current);
    }
    bubbleTimerRef.current = setTimeout(() => {
      // Só exibe se o painel de chat não estiver aberto
      setShowBubble((prev) => {
        return !isChatOpen;
      });
    }, delayMs);
  };

  useEffect(() => {
    // 60 segundos após o carregamento da página
    scheduleBubble(60000);

    return () => {
      if (bubbleTimerRef.current) {
        clearTimeout(bubbleTimerRef.current);
      }
    };
  }, []);

  // Foco no input ao abrir o painel de chat
  useEffect(() => {
    if (isChatOpen) {
      setShowBubble(false);
      if (bubbleTimerRef.current) {
        clearTimeout(bubbleTimerRef.current);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isChatOpen]);

  // Tecla Escape para fechar chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen]);

  // Fechar a bolha proativa pelo X e reagendar para 90s depois
  const handleDismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBubble(false);
    setHasInteracted(true);
    scheduleBubble(90000);
  };

  // Clique na bolha proativa -> abre WhatsApp direto
  const handleBubbleClick = () => {
    trackEvent('whatsapp_click', { section: 'floating-bubble' });
    setShowBubble(false);
    setHasInteracted(true);
    const url = buildWhatsAppUrl({
      originSection: 'balao-flutuante',
      customText: 'Olá, Garagem Mailasque! Vi a mensagem no site e gostaria de um orçamento para o meu veículo.',
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Clique no botão flutuante principal
  const handleMainButtonClick = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
    } else {
      trackEvent('whatsapp_click', { section: 'floating-open-chat' });
      setShowBubble(false);
      setHasInteracted(true);
      setIsChatOpen(true);
    }
  };

  // Envio de mensagem pelo formulário do painel de chat
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = messageInput.trim();
    trackEvent('whatsapp_click', {
      section: 'floating-chat-send',
      has_custom_message: Boolean(trimmed),
    });

    const url = buildWhatsAppUrl({
      originSection: 'chat-flutuante',
      customText: trimmed || 'Olá, Garagem Mailasque! Vim pelo site e gostaria de tirar uma dúvida sobre funilaria e pintura.',
    });

    window.open(url, '_blank', 'noopener,noreferrer');
    setMessageInput('');
    setIsChatOpen(false);
  };

  const defaultWhatsAppUrl = buildWhatsAppUrl({
    originSection: 'botao-flutuante',
    customText: 'Olá, Garagem Mailasque! Vim pelo site e gostaria de um orçamento para funilaria e pintura.',
  });

  return (
    <aside
      aria-label="Atendimento rápido pelo WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] pointer-events-none select-none"
    >
      {/* 1. Painel de Chat Expandido */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            key="whatsapp-chat-panel"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            transition={{
              duration: shouldReduceMotion ? 0.15 : 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pointer-events-auto mb-3 w-[calc(100vw-2.5rem)] sm:w-84 md:w-96 max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#121212] text-white flex flex-col ring-1 ring-black/40"
            role="dialog"
            aria-modal="true"
            aria-label="Janela de atendimento Garagem Mailasque"
          >
            {/* Cabeçalho do Chat em Gradiente Verde Oficial */}
            <div className="bg-gradient-to-r from-[#075E54] to-[#128C7E] px-4 py-3.5 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-white/10 p-0.5 border border-white/20 shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    src="/assets/garagemailasque/logo-garagem-mailasque.png"
                    alt="Logo Garagem Mailasque"
                    className="w-full h-full object-contain"
                    width={40}
                    height={40}
                  />
                  {isOnline && (
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25D366] border-2 border-[#075E54]"
                      title="Atendimento online agora"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight leading-tight text-white">
                    Garagem Mailasque
                  </h3>
                  <p className="text-[11px] text-white/80 flex items-center gap-1.5 leading-none mt-0.5">
                    {isOnline ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] shrink-0" />
                        <span>Online agora · Resposta rápida</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
                        <span>Fora do expediente · Deixe seu recado</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-white"
                aria-label="Fechar janela de conversa"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Área de Mensagens com visual temático WhatsApp */}
            <div className="p-4 bg-[#0B141A] min-h-[160px] max-h-[220px] overflow-y-auto space-y-3">
              <div className="flex justify-center">
                <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-900/80 px-2.5 py-1 rounded-full border border-neutral-800">
                  Canal Oficial de Atendimento
                </span>
              </div>

              {/* Balão de Mensagem de Boas-Vindas */}
              <div className="relative max-w-[85%] bg-[#202C33] text-neutral-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-md border border-neutral-700/50">
                <p className="text-xs leading-relaxed">
                  Olá! Seja muito bem-vindo à <strong className="text-white">Garagem Mailasque</strong>. 👋
                </p>
                <p className="text-xs leading-relaxed mt-1.5 text-neutral-300">
                  Como podemos ajudar com a funilaria ou pintura do seu carro hoje? Digite sua dúvida ou peça seu orçamento abaixo:
                </p>
                <span className="block text-[10px] text-right text-neutral-400 mt-1 tabular-nums">
                  {currentTimeStr}
                </span>
              </div>
            </div>

            {/* Rodapé / Input de Mensagem */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#1F2C34] border-t border-neutral-700/50 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Digite sua mensagem aqui..."
                className="flex-1 bg-[#2A3942] text-white text-xs px-3.5 py-2.5 rounded-full placeholder-neutral-400 border border-transparent focus:border-[#25D366] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-[#00A884] hover:bg-[#02906f] text-white flex items-center justify-center shrink-0 transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-[#25D366] shadow-md"
                aria-label="Enviar mensagem no WhatsApp"
              >
                <Send className="w-4 h-4 ml-0.5" aria-hidden="true" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Bolha de Mensagem Proativa (textos centralizados e entrada elástica orgânica) */}
      <AnimatePresence>
        {showBubble && !isChatOpen && (
          <motion.div
            id="whatsapp-proactive-bubble"
            key="whatsapp-proactive-bubble"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            onClick={handleBubbleClick}
            className="whatsapp-proactive-bubble pointer-events-auto relative mb-3 w-[270px] sm:w-[290px] rounded-2xl bg-[#141414]/95 backdrop-blur-md text-white p-3.5 shadow-xl shadow-black/60 border border-white/10 hover:border-[#25D366]/40 cursor-pointer group transition-all text-center"
            role="alert"
            aria-live="polite"
          >
            {/* Botão de Fechar Minimalista (X) */}
            <button
              type="button"
              onClick={handleDismissBubble}
              className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#25D366]"
              aria-label="Fechar recado do WhatsApp"
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </button>

            {/* Conteúdo Centralizado */}
            <div className="flex flex-col items-center text-center px-1">
              {/* Topo: Avatar + Nome da Oficina + Status Online (alinhado à esquerda) */}
              <div className="w-full flex items-center justify-start gap-1.5 mb-1">
                <div className="relative shrink-0">
                  <div className="w-6 h-6 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center overflow-hidden">
                    <img
                      src="/assets/garagemailasque/logo-garagem-mailasque.png"
                      alt="Garagem Mailasque"
                      className="w-full h-full object-contain p-0.5"
                      width={24}
                      height={24}
                    />
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-[#141414] ${
                      isOnline ? 'bg-[#25D366]' : 'bg-[#F59E0B]'
                    }`}
                  />
                </div>
                <span className="text-xs font-semibold text-white hover:text-[#F97316] transition-colors">
                  Garagem Mailasque
                </span>
                {isOnline ? (
                  <span className="text-[10px] text-[#25D366] font-medium shrink-0">· Online</span>
                ) : (
                  <span className="text-[10px] text-[#F59E0B] font-medium shrink-0">· Responderemos em breve</span>
                )}
              </div>

              {/* Pergunta Centralizada */}
              <p className="text-[11px] sm:text-xs font-bold text-neutral-200 leading-snug text-center max-w-[240px] relative translate-y-[1px]">
                Olá. Precisa de um orçamento para funilaria ou pintura?
              </p>

              {/* CTA Centralizado com Seta Diagonal apontando para o botão flutuante */}
              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#25D366] group-hover:text-[#20BA5A] transition-colors">
                <span>Falar no WhatsApp</span>
                <ArrowDownRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5] text-[#25D366] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" aria-hidden="true" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Botão Flutuante Principal: Bola com efeito de pulso gradiente em verde degradê e logotipo do WhatsApp */}
      <div className="relative pointer-events-auto flex items-center justify-center">
        {/* Efeito de pulso gradiente em degradê verde */}
        {!isChatOpen && (
          <span
            className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#059669] via-[#10B981] to-[#25D366] pointer-events-none animate-whatsapp-gradient-aura"
            aria-hidden="true"
          />
        )}

        {/* Botão de Ação Principal: Bola verde oficial com logotipo do WhatsApp em branco */}
        <a
          href={defaultWhatsAppUrl}
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            handleMainButtonClick();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleMainButtonClick();
            }
          }}
          className="whatsapp-floating-action-btn whatsapp-gradient-pulse-btn group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full text-white shadow-xl hover:shadow-2xl active:scale-95 focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
          aria-expanded={isChatOpen}
          aria-label={isChatOpen ? "Fechar atendimento no WhatsApp" : "Abrir atendimento da Garagem Mailasque no WhatsApp"}
        >
          {/* Badge saltitante de notificação '1' */}
          {!hasInteracted && !isChatOpen && (
            <span
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-white text-[11px] font-black border-2 border-[#121212] shadow-md animate-badge-bounce pointer-events-none"
              aria-label="1 nova mensagem"
            >
              1
            </span>
          )}

          {/* Ícone oficial do WhatsApp em branco, ou X em branco quando o chat estiver aberto */}
          {isChatOpen ? (
            <X className="w-6 h-6 text-white transition-transform group-hover:rotate-90" aria-hidden="true" />
          ) : (
            <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8 fill-current text-white transition-transform group-hover:scale-110" />
          )}
        </a>
      </div>
    </aside>
  );
};

export default FloatingWhatsApp;
