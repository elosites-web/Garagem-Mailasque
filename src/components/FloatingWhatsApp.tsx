import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, Send, ArrowDownRight, CheckCheck } from 'lucide-react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { buildWhatsAppUrl, isWorkshopOpenNow, WHATSAPP_TEMPLATES } from '../data/business';
import { trackEvent, trackWhatsAppConversion } from '../utils/analytics';

export const FloatingWhatsApp: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [isOnline, setIsOnline] = useState<boolean>(() => isWorkshopOpenNow());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [outgoingBubbleText, setOutgoingBubbleText] = useState<string | null>(null);

  const bubbleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const closeChatButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const mainButtonRef = useRef<HTMLAnchorElement>(null);

  /**
   * Restaura o foco de forma determinística para o botão flutuante principal,
   * evitando perda de foco para document.body durante o desmonte do AnimatePresence.
   */
  const focusMainButton = useCallback(() => {
    mainButtonRef.current?.focus();
    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      window.requestAnimationFrame(() => {
        mainButtonRef.current?.focus();
      });
    }
  }, []);

  /**
   * Fecha o painel de chat e devolve imediatamente o foco ao botão acionador principal.
   */
  const closeChatPanel = useCallback(
    (restoreFocus = true) => {
      if (sendTimerRef.current) {
        clearTimeout(sendTimerRef.current);
        sendTimerRef.current = null;
      }
      setIsSending(false);
      setOutgoingBubbleText(null);
      setIsChatOpen(false);
      if (restoreFocus) {
        focusMainButton();
      }
    },
    [focusMainButton]
  );

  useEffect(() => {
    return () => {
      if (sendTimerRef.current) {
        clearTimeout(sendTimerRef.current);
      }
    };
  }, []);

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
  const scheduleBubble = useCallback(
    (delayMs: number) => {
      if (bubbleTimerRef.current) {
        clearTimeout(bubbleTimerRef.current);
      }
      bubbleTimerRef.current = setTimeout(() => {
        // Só exibe se o painel de chat não estiver aberto
        setShowBubble(() => !isChatOpen);
      }, delayMs);
    },
    [isChatOpen]
  );

  useEffect(() => {
    // 60 segundos após o carregamento da página
    scheduleBubble(60000);

    return () => {
      if (bubbleTimerRef.current) {
        clearTimeout(bubbleTimerRef.current);
      }
    };
  }, [scheduleBubble]);

  // Foco no input ao abrir o painel de chat
  useEffect(() => {
    if (isChatOpen) {
      setShowBubble(false);
      if (bubbleTimerRef.current) {
        clearTimeout(bubbleTimerRef.current);
      }
      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(focusTimer);
    }
  }, [isChatOpen]);

  // Gerenciamento de teclado no painel de chat: Escape fecha e restaura foco; Tab mantém foco cíclico no modal
  useEffect(() => {
    if (!isChatOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeChatPanel(true);
        return;
      }

      if (e.key === 'Tab') {
        const rawElements: Array<HTMLElement | null> = [
          closeChatButtonRef.current,
          inputRef.current,
          sendButtonRef.current,
          mainButtonRef.current,
        ];
        const focusableElements = rawElements.filter((el): el is HTMLElement => el !== null);

        if (focusableElements.length === 0) return;

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];
        const activeEl = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (!activeEl || activeEl === firstEl || !focusableElements.includes(activeEl)) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (!activeEl || activeEl === lastEl || !focusableElements.includes(activeEl)) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen, closeChatPanel]);

  // Fechar a bolha proativa pelo X, restaurar foco se acionado via teclado e reagendar para 90s depois
  const handleDismissBubble = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setShowBubble(false);
    setHasInteracted(true);
    scheduleBubble(90000);
    focusMainButton();
  };

  // Clique ou ativação por teclado na bolha proativa -> abre WhatsApp direto
  const handleBubbleClick = () => {
    trackWhatsAppConversion('floating-bubble');
    setShowBubble(false);
    setHasInteracted(true);
    const url = buildWhatsAppUrl({
      originSection: 'balao-flutuante',
      customText: WHATSAPP_TEMPLATES.floatingBubble(),
    });
    window.open(url, '_blank', 'noopener,noreferrer');
    focusMainButton();
  };

  const handleBubbleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBubbleClick();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleDismissBubble(e);
    }
  };

  // Clique no botão flutuante principal (abre/fecha o widget interno, sem disparar evento de conversão)
  const handleMainButtonClick = () => {
    if (isChatOpen) {
      closeChatPanel(true);
    } else {
      trackEvent('chat_widget_toggle', { section: 'floating-button', action: 'open' });
      setShowBubble(false);
      setHasInteracted(true);
      setIsChatOpen(true);
    }
  };

  // Envio de mensagem pelo formulário do painel de chat com feedback tátil e bolha flutuante de saída
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;

    const trimmed = messageInput.trim();
    trackWhatsAppConversion('floating-chat-send', {
      has_custom_message: Boolean(trimmed),
    });

    const fallbackText = WHATSAPP_TEMPLATES.floatingChatFallback();
    const previewText =
      trimmed || 'Olá, Garagem Mailasque! Vim pelo site e gostaria de tirar uma dúvida sobre funilaria e pintura.';

    const url = buildWhatsAppUrl({
      originSection: 'chat-flutuante',
      customText: trimmed || fallbackText,
    });

    setIsSending(true);
    setOutgoingBubbleText(previewText);
    setMessageInput('');

    window.open(url, '_blank', 'noopener,noreferrer');

    if (sendTimerRef.current) {
      clearTimeout(sendTimerRef.current);
    }
    sendTimerRef.current = setTimeout(
      () => {
        closeChatPanel(true);
      },
      shouldReduceMotion ? 160 : 520
    );
  };

  const defaultWhatsAppUrl = buildWhatsAppUrl({
    originSection: 'botao-flutuante',
    customText: WHATSAPP_TEMPLATES.floatingButtonDefault(),
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
            ref={chatPanelRef}
            id="whatsapp-chat-panel"
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
                ref={closeChatButtonRef}
                type="button"
                onClick={() => closeChatPanel(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#075E54] focus-visible:bg-white/20 focus-visible:text-white"
                aria-label="Fechar janela de conversa"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Área de Mensagens com visual temático WhatsApp */}
            <div className="p-4 bg-[#0B141A] min-h-[160px] max-h-[240px] overflow-y-auto space-y-3 relative">
              <div className="flex justify-center">
                <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-900/80 px-2.5 py-1 rounded-full border border-neutral-800">
                  Canal Oficial de Atendimento
                </span>
              </div>

              {/* Balão de Mensagem de Boas-Vindas */}
              <div className="relative max-w-[85%] bg-[#202C33] text-neutral-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-md border border-neutral-700/50">
                <p className="text-xs leading-relaxed">
                  Olá! Seja muito bem-vindo à <strong className="text-white">Garagem Mailasque</strong>.
                </p>
                <p className="text-xs leading-relaxed mt-1.5 text-neutral-300">
                  Como podemos ajudar com a funilaria ou pintura do seu carro hoje? Digite sua dúvida ou peça seu orçamento abaixo:
                </p>
                <span className="block text-[10px] text-right text-neutral-400 mt-1 tabular-nums">
                  {currentTimeStr}
                </span>
              </div>

              {/* Bolha de Mensagem Enviada Flutuando da Área de Texto para a Conversa */}
              <AnimatePresence>
                {outgoingBubbleText && (
                  <motion.div
                    key="outgoing-floating-message"
                    initial={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 28, x: 8, scale: 0.9 }
                    }
                    animate={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : {
                            opacity: [0, 1, 1, 0.92],
                            y: [28, 0, -6],
                            x: [8, 0, 0],
                            scale: [0.9, 1.02, 1],
                          }
                    }
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.95 }}
                    transition={{
                      duration: shouldReduceMotion ? 0.12 : 0.46,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{ transformOrigin: 'bottom right' }}
                    className="ml-auto max-w-[85%] bg-[#005C4B] text-white rounded-2xl rounded-tr-sm px-3.5 py-2 shadow-lg border border-[#25D366]/30 pointer-events-none"
                    aria-live="polite"
                  >
                    <p className="text-xs leading-relaxed break-words line-clamp-2">
                      {outgoingBubbleText}
                    </p>
                    <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-white/75 tabular-nums">
                      <span>{currentTimeStr}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] shrink-0" aria-hidden="true" />
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Rodapé / Input de Mensagem */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#1F2C34] border-t border-neutral-700/50 flex items-center gap-2">
              <motion.input
                ref={inputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={isSending ? 'Enviando para o WhatsApp...' : 'Digite sua mensagem aqui...'}
                aria-label="Digite sua mensagem para o WhatsApp"
                animate={
                  isSending && !shouldReduceMotion
                    ? { scale: [1, 0.985, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 bg-[#2A3942] text-white text-xs px-3.5 py-2.5 rounded-full placeholder-neutral-300 border border-white/15 focus:border-[#25D366] focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F2C34] transition-colors"
              />
              <motion.button
                ref={sendButtonRef}
                type="submit"
                disabled={isSending}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.88 }}
                animate={
                  isSending
                    ? shouldReduceMotion
                      ? { backgroundColor: '#25D366' }
                      : {
                          scale: [1, 0.86, 1.14, 1],
                          backgroundColor: ['#00A884', '#25D366', '#10B981', '#00A884'],
                          boxShadow: [
                            '0 4px 6px rgba(0,0,0,0.3)',
                            '0 0 18px rgba(37,211,102,0.75)',
                            '0 4px 6px rgba(0,0,0,0.3)',
                          ],
                        }
                    : {
                        scale: 1,
                        backgroundColor: '#00A884',
                      }
                }
                transition={{
                  duration: shouldReduceMotion ? 0.12 : 0.42,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="w-9 h-9 rounded-full bg-[#00A884] hover:bg-[#02906f] text-white flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F2C34] shadow-md overflow-hidden cursor-pointer disabled:cursor-default"
                aria-label="Enviar mensagem no WhatsApp"
              >
                <motion.span
                  animate={
                    isSending && !shouldReduceMotion
                      ? {
                          x: [0, 10, -8, 0],
                          y: [0, -10, 8, 0],
                          opacity: [1, 0, 0, 1],
                          scale: [1, 0.8, 0.8, 1],
                        }
                      : { x: 0, y: 0, opacity: 1, scale: 1 }
                  }
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-center"
                >
                  <Send className="w-4 h-4 ml-0.5" aria-hidden="true" />
                </motion.span>
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Bolha de Mensagem Proativa (fade-in com deslize vertical orgânico no canto da tela) */}
      <AnimatePresence>
        {showBubble && !isChatOpen && (
          <motion.div
            id="whatsapp-proactive-bubble"
            key="whatsapp-proactive-bubble"
            role="button"
            tabIndex={0}
            aria-label="Olá. Precisa de um orçamento para funilaria ou pintura? Falar no WhatsApp"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.15 }
                : {
                    type: 'spring',
                    stiffness: 360,
                    damping: 26,
                    mass: 0.85,
                    opacity: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                  }
            }
            style={{ transformOrigin: 'bottom right' }}
            onClick={handleBubbleClick}
            onKeyDown={handleBubbleKeyDown}
            className="whatsapp-proactive-bubble pointer-events-auto relative mb-3 w-[270px] sm:w-[290px] rounded-2xl bg-[#141414]/95 backdrop-blur-md text-white p-3.5 shadow-xl shadow-black/60 border border-white/10 hover:border-[#25D366]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0E0E] focus-visible:border-[#25D366] cursor-pointer group transition-[border-color,box-shadow] duration-300 text-center"
          >
            {/* Botão de Fechar Minimalista (X) */}
            <button
              type="button"
              onClick={handleDismissBubble}
              className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full text-neutral-300 hover:text-white hover:bg-white/15 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] focus-visible:bg-white/20 focus-visible:text-white"
              aria-label="Fechar recado do WhatsApp"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            {/* Conteúdo Centralizado */}
            <div className="flex flex-col items-center text-center px-1" aria-live="polite">
              {/* Topo: Avatar + Nome da Oficina em linha única + Status abaixo */}
              <div className="w-full grid grid-cols-[auto_1fr] items-center justify-items-start gap-x-2 gap-y-0.5 text-left mb-1.5">
                <div className="relative shrink-0 row-span-2">
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
                <span className="col-start-2 text-xs font-semibold text-white whitespace-nowrap leading-tight group-hover:text-[#F97316] transition-colors">
                  Garagem Mailasque
                </span>
                {isOnline ? (
                  <span className="col-start-2 text-[10px] text-[#25D366] font-medium whitespace-nowrap leading-tight">
                    Online
                  </span>
                ) : (
                  <span className="col-start-2 text-[10px] text-[#F59E0B] font-medium whitespace-nowrap leading-tight">
                    Responderemos em breve
                  </span>
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
          ref={mainButtonRef}
          id="whatsapp-floating-main-btn"
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
          className="whatsapp-floating-action-btn whatsapp-gradient-pulse-btn group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full text-white shadow-xl hover:shadow-2xl active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0E0E] cursor-pointer"
          aria-expanded={isChatOpen}
          aria-controls={isChatOpen ? 'whatsapp-chat-panel' : undefined}
          aria-label={isChatOpen ? 'Fechar atendimento no WhatsApp' : 'Abrir atendimento da Garagem Mailasque no WhatsApp'}
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
