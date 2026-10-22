import React, { useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { GalleryItem } from '../data/gallery';
import { buildWhatsAppUrl } from '../data/business';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { trackEvent } from '../utils/analytics';

export type { GalleryItem };

interface LightboxModalProps {
  items: GalleryItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const currentItem = items[currentIndex];

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!modalRef.current) return [];
    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), video[controls]'
      )
    ).filter((el) => el.offsetParent !== null);
  }, []);

  // Teclado: Escape fecha, setas navegam, Tab fica preso no modal (Focus Trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate(currentIndex < items.length - 1 ? currentIndex + 1 : 0);
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate(currentIndex > 0 ? currentIndex - 1 : items.length - 1);
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length, onClose, onNavigate, getFocusableElements]);

  // Bloqueio de scroll e foco inicial no botão fechar
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!isOpen || !currentItem) return null;

  const isVideo = currentItem.type === 'video';
  const isTeam = currentItem.type === 'team';
  const modalAriaLabel = isVideo ? currentItem.title : currentItem.caption;

  // Nome dinâmico do serviço realizado na mídia exibida
  const serviceName = currentItem.serviceName || (isVideo ? currentItem.title : currentItem.caption);

  const handleSimilarQuoteClick = () => {
    trackEvent('whatsapp_click', {
      origin: 'lightbox_similar_quote',
      service: serviceName,
      itemId: currentItem.id,
    });
  };

  const whatsappHref = buildWhatsAppUrl({
    originSection: `lightbox-${currentItem.id}`,
    service: serviceName,
    customText: `Olá, Garagem Mailasque! Vi o serviço de "${serviceName}" na galeria do site e gostaria de solicitar um orçamento similar para meu carro.`,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={modalAriaLabel}
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-md"
    >
      {/* Botão de Fechar */}
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-[#1F1F1F]/80 text-[#F5F5F5] hover:bg-[#F97316] hover:text-[#0A0A0A] transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
        aria-label="Fechar visualizador"
      >
        <X className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Navegação Anterior */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={() => onNavigate(currentIndex > 0 ? currentIndex - 1 : items.length - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[#1F1F1F]/80 text-[#F5F5F5] hover:bg-[#F97316] hover:text-[#0A0A0A] transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
          aria-label="Mídia anterior"
        >
          <ChevronLeft className="w-6 h-6" aria-hidden="true" />
        </button>
      )}

      {/* Navegação Próxima */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={() => onNavigate(currentIndex < items.length - 1 ? currentIndex + 1 : 0)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[#1F1F1F]/80 text-[#F5F5F5] hover:bg-[#F97316] hover:text-[#0A0A0A] transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
          aria-label="Próxima mídia"
        >
          <ChevronRight className="w-6 h-6" aria-hidden="true" />
        </button>
      )}

      {/* Conteúdo Central */}
      <div className="relative max-w-5xl w-full max-h-[88vh] flex flex-col items-center justify-center">
        {isTeam ? (
          <div className="w-full flex flex-col items-center">
            {/* As duas fotos da equipe exibidas lado a lado no próprio Lightbox */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-h-[56vh] sm:max-h-[60vh] w-full">
              <img
                src={currentItem.photos[0].src}
                alt={currentItem.photos[0].alt}
                width={currentItem.photos[0].width}
                height={currentItem.photos[0].height}
                loading="lazy"
                decoding="async"
                className="max-h-[26vh] sm:max-h-[60vh] w-auto max-w-[95%] sm:max-w-[48%] object-contain rounded-xl shadow-2xl border border-[#2C2C2C]"
              />
              <img
                src={currentItem.photos[1].src}
                alt={currentItem.photos[1].alt}
                width={currentItem.photos[1].width}
                height={currentItem.photos[1].height}
                loading="lazy"
                decoding="async"
                className="max-h-[26vh] sm:max-h-[60vh] w-auto max-w-[95%] sm:max-w-[48%] object-contain rounded-xl shadow-2xl border border-[#2C2C2C]"
              />
            </div>
            {/* Legenda Dinâmica e Botão de Orçamento Similar */}
            <div className="mt-3.5 text-center max-w-xl flex flex-col items-center px-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F97316]/10 border border-[#F97316]/30 mb-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
                <span className="text-xs font-bold text-[#F97316] uppercase tracking-wide">
                  Serviço: {serviceName}
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-[#F5F5F5]">{currentItem.caption}</p>
              <p className="text-xs text-[#A3A3A3] mt-0.5">Equipe técnica e qualificada da Garagem Mailasque</p>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSimilarQuoteClick}
                className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] font-bold text-xs sm:text-sm transition-all duration-150 shadow-md hover:shadow-[#F97316]/20 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#F97316]"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Solicitar orçamento similar</span>
              </a>
            </div>
          </div>
        ) : isVideo ? (
          <div className="w-full flex flex-col items-center">
            <video
              key={currentItem.src}
              src={currentItem.src}
              controls
              playsInline
              preload="metadata"
              poster={currentItem.poster}
              className="max-h-[56vh] sm:max-h-[60vh] w-auto max-w-full rounded-xl shadow-2xl bg-black border border-[#2C2C2C]"
            >
              Seu navegador não suporta a reprodução deste vídeo.
            </video>
            {/* Legenda Dinâmica e Botão de Orçamento Similar */}
            <div className="mt-3.5 text-center max-w-xl flex flex-col items-center px-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F97316]/10 border border-[#F97316]/30 mb-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
                <span className="text-xs font-bold text-[#F97316] uppercase tracking-wide">
                  Serviço: {serviceName}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#F5F5F5]">{currentItem.title}</h3>
              <p className="text-xs text-[#A3A3A3] mt-0.5">{currentItem.description}</p>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSimilarQuoteClick}
                className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] font-bold text-xs sm:text-sm transition-all duration-150 shadow-md hover:shadow-[#F97316]/20 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#F97316]"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Solicitar orçamento similar</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <img
              src={currentItem.src}
              alt={currentItem.alt}
              width={currentItem.width}
              height={currentItem.height}
              loading="lazy"
              decoding="async"
              className="max-h-[56vh] sm:max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-[#2C2C2C]"
            />
            {/* Legenda Dinâmica e Botão de Orçamento Similar */}
            <div className="mt-3.5 text-center max-w-xl flex flex-col items-center px-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F97316]/10 border border-[#F97316]/30 mb-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
                <span className="text-xs font-bold text-[#F97316] uppercase tracking-wide">
                  Serviço: {serviceName}
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-[#F5F5F5]">{currentItem.caption}</p>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSimilarQuoteClick}
                className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] font-bold text-xs sm:text-sm transition-all duration-150 shadow-md hover:shadow-[#F97316]/20 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#F97316]"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Solicitar orçamento similar</span>
              </a>
            </div>
          </div>
        )}

        {/* Contador */}
        <div className="mt-2.5 text-xs text-[#737373]">
          {currentIndex + 1} de {items.length}
        </div>
      </div>
    </div>
  );
};
