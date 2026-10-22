import React, { useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryItem } from '../data/gallery';

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
      <div className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center">
        {isTeam ? (
          <div className="w-full flex flex-col items-center">
            {/* As duas fotos da equipe exibidas lado a lado no próprio Lightbox */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-h-[72vh] w-full">
              <img
                src={currentItem.photos[0].src}
                alt={currentItem.photos[0].alt}
                width={currentItem.photos[0].width}
                height={currentItem.photos[0].height}
                className="max-h-[34vh] sm:max-h-[68vh] w-auto max-w-[95%] sm:max-w-[48%] object-contain rounded-xl shadow-2xl border border-[#2C2C2C]"
              />
              <img
                src={currentItem.photos[1].src}
                alt={currentItem.photos[1].alt}
                width={currentItem.photos[1].width}
                height={currentItem.photos[1].height}
                className="max-h-[34vh] sm:max-h-[68vh] w-auto max-w-[95%] sm:max-w-[48%] object-contain rounded-xl shadow-2xl border border-[#2C2C2C]"
              />
            </div>
            <div className="mt-4 text-center max-w-xl">
              <p className="text-base font-bold text-[#F5F5F5]">{currentItem.caption}</p>
              <p className="text-xs text-[#A3A3A3] mt-1">Equipe unida e especializada da Garagem Mailasque</p>
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
              className="max-h-[70vh] w-auto max-w-full rounded-xl shadow-2xl bg-black border border-[#2C2C2C]"
            >
              Seu navegador não suporta a reprodução deste vídeo.
            </video>
            <div className="mt-4 text-center max-w-xl">
              <h3 className="text-base font-bold text-[#F5F5F5]">{currentItem.title}</h3>
              <p className="text-xs text-[#A3A3A3] mt-1">{currentItem.description}</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <img
              src={currentItem.src}
              alt={currentItem.alt}
              width={currentItem.width}
              height={currentItem.height}
              className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-[#2C2C2C]"
            />
            <div className="mt-4 text-center max-w-xl">
              <p className="text-sm font-semibold text-[#F5F5F5]">{currentItem.caption}</p>
            </div>
          </div>
        )}

        {/* Contador */}
        <div className="mt-3 text-xs text-[#737373]">
          {currentIndex + 1} de {items.length}
        </div>
      </div>
    </div>
  );
};
