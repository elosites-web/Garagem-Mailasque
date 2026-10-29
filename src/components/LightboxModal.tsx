import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryItem } from '../data/gallery';

export type { GalleryItem };

export interface SwipeEvaluation {
  isSwipe: boolean;
  direction: 'next' | 'prev' | null;
  deltaX: number;
  deltaY: number;
  velocity: number;
}

/**
 * Avalia se um gesto de toque constitui um swipe horizontal intencional.
 * Requer dominância horizontal para não conflitar com rolagem vertical ou toques acidentais.
 */
export function evaluateSwipeGesture({
  deltaX,
  deltaY,
  durationMs,
  minDistance = 40,
  minVelocity = 0.28,
  horizontalDominanceRatio = 1.2,
}: {
  deltaX: number;
  deltaY: number;
  durationMs: number;
  minDistance?: number;
  minVelocity?: number;
  horizontalDominanceRatio?: number;
}): SwipeEvaluation {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const velocity = durationMs > 0 ? absX / durationMs : 0;

  // Requer dominância horizontal para garantir que gestos verticais ou diagonais não disparem navegação
  const isHorizontallyDominant = absX > absY * horizontalDominanceRatio;

  // Considera gesto válido se atingir a distância mínima OU for um movimento rápido ("flick")
  const meetsDistance = absX >= minDistance;
  const isFlick = absX >= 24 && durationMs < 350 && velocity >= minVelocity;

  const isSwipe = isHorizontallyDominant && (meetsDistance || isFlick);

  if (!isSwipe) {
    return { isSwipe: false, direction: null, deltaX, deltaY, velocity };
  }

  return {
    isSwipe: true,
    direction: deltaX < 0 ? 'next' : 'prev',
    deltaX,
    deltaY,
    velocity,
  };
}

/**
 * Identifica se o alvo do toque é um elemento ou controle interativo nativo
 * (vídeo, botão, link, input) que não deve ter seu toque interceptado para swipe.
 */
export function isInteractiveSwipeTarget(target: EventTarget | null): boolean {
  if (!target) return false;
  const el = target as unknown as { closest?: (selector: string) => unknown };
  if (typeof el.closest !== 'function') return false;
  return !!el.closest(
    'button, a, video, audio, input, textarea, select, [role="button"], [data-no-swipe="true"]'
  );
}

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
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const isSwipingHorizontal = useRef<boolean>(false);

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
            lastElement.focus({ preventScroll: true });
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus({ preventScroll: true });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length, onClose, onNavigate, getFocusableElements]);

  // Bloqueio de scroll blindado para celular e desktop preservando a ancoragem exata da tela
  useEffect(() => {
    if (!isOpen) return;

    // Salva a posição exata de rolagem da janela antes de abrir o modal
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyLeft = document.body.style.left;
    const originalBodyRight = document.body.style.right;
    const originalBodyWidth = document.body.style.width;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyOverscroll = document.body.style.overscrollBehavior;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    // Fixa o body na posição exata para evitar qualquer pulo ou ancoragem desencaixada no mobile
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';

    // Foco inicial no botão fechar sem rolar a viewport (preventScroll: true)
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    }, 50);

    return () => {
      clearTimeout(timer);

      // Restaura estilos originais do body e html
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.left = originalBodyLeft;
      document.body.style.right = originalBodyRight;
      document.body.style.width = originalBodyWidth;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.overscrollBehavior = originalBodyOverscroll;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;

      // Restaura a ancoragem e coordenada de scroll anterior com precisão instantânea
      window.scrollTo({
        top: scrollY,
        left: 0,
        behavior: 'instant' as ScrollBehavior,
      });

      // Segunda verificação assíncrona para navegadores móveis (Safari iOS)
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollY,
          left: 0,
          behavior: 'instant' as ScrollBehavior,
        });
      });
    };
  }, [isOpen]);

  // Tratamento nativo e não-passivo de touchmove no modal para capturar gestos de swipe
  // e impedir estritamente que o toque se propague ou trave o scroll da página principal
  useEffect(() => {
    if (!isOpen) return;
    const modalEl = modalRef.current;
    if (!modalEl) return;

    const handleNativeTouchMove = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      if (e.touches.length !== 1) return; // Ignora multi-touch / pinch zoom

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Detecta dominância horizontal no início do movimento (a partir de 6px)
      if (!isSwipingHorizontal.current && absX > 6 && absX > absY * 1.1) {
        isSwipingHorizontal.current = true;
      }

      // Se for swipe horizontal, captura o gesto exclusivamente para o lightbox:
      // previne a rolagem e rubber-banding nativos do navegador móvel e não propaga para a página principal
      if (isSwipingHorizontal.current) {
        if (e.cancelable) {
          e.preventDefault();
        }
        e.stopPropagation();
      }
    };

    // Registra listener nativo com passive: false para permitir preventDefault()
    modalEl.addEventListener('touchmove', handleNativeTouchMove, { passive: false });

    return () => {
      modalEl.removeEventListener('touchmove', handleNativeTouchMove);
    };
  }, [isOpen]);

  const resetTouchState = useCallback(() => {
    touchStartX.current = null;
    touchStartY.current = null;
    touchStartTime.current = null;
    isSwipingHorizontal.current = false;
  }, []);

  // Gestos de toque para deslizar no celular (Swipe horizontal)
  const handleTouchStart = (e: React.TouchEvent) => {
    // Se o toque iniciou em botão, vídeo ou controle interativo, não intercepta para swipe
    if (isInteractiveSwipeTarget(e.target)) {
      resetTouchState();
      return;
    }

    const touch = e.touches[0];
    if (!touch) return;

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    isSwipingHorizontal.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null ||
      touchStartTime.current === null
    ) {
      resetTouchState();
      return;
    }

    const touch = e.changedTouches[0];
    if (!touch) {
      resetTouchState();
      return;
    }

    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    const durationMs = Date.now() - touchStartTime.current;

    const evaluation = evaluateSwipeGesture({
      deltaX,
      deltaY,
      durationMs,
    });

    if (evaluation.isSwipe && evaluation.direction) {
      if (evaluation.direction === 'next') {
        // Deslizar para a esquerda -> Próxima mídia
        onNavigate(currentIndex < items.length - 1 ? currentIndex + 1 : 0);
      } else {
        // Deslizar para a direita -> Mídia anterior
        onNavigate(currentIndex > 0 ? currentIndex - 1 : items.length - 1);
      }
    }

    resetTouchState();
  };

  const handleTouchCancel = () => {
    resetTouchState();
  };

  if (!isOpen || !currentItem) return null;

  const isVideo = currentItem.type === 'video';
  const isTeam = currentItem.type === 'team';
  const modalAriaLabel = isVideo ? currentItem.title : currentItem.caption;


  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={modalAriaLabel}
      ref={modalRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain bg-black/95 backdrop-blur-md select-none touch-manipulation"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Botão de Fechar fixo para nunca sumir caso o usuário role no celular */}
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[10000] p-3 rounded-full bg-[#1F1F1F]/90 text-[#F5F5F5] hover:bg-[#F97316] hover:text-[#0A0A0A] shadow-2xl border border-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316] touch-manipulation cursor-pointer"
        aria-label="Fechar visualizador"
      >
        <X className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Navegação Anterior */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={() => onNavigate(currentIndex > 0 ? currentIndex - 1 : items.length - 1)}
          className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[60] p-2.5 sm:p-3 rounded-full bg-[#1F1F1F]/90 text-[#F5F5F5] hover:bg-[#F97316] hover:text-[#0A0A0A] shadow-2xl border border-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316] touch-manipulation cursor-pointer"
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
          className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[60] p-2.5 sm:p-3 rounded-full bg-[#1F1F1F]/90 text-[#F5F5F5] hover:bg-[#F97316] hover:text-[#0A0A0A] shadow-2xl border border-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316] touch-manipulation cursor-pointer"
          aria-label="Próxima mídia"
        >
          <ChevronRight className="w-6 h-6" aria-hidden="true" />
        </button>
      )}

      {/* Wrapper de centralização que permite rolagem natural em telas menores */}
      <div
        className="min-h-full w-full flex items-center justify-center p-4 sm:p-6 md:p-10 py-16 sm:py-12"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Conteúdo Central */}
        <div
          className="relative max-w-5xl w-full flex flex-col items-center justify-center"
          style={{ touchAction: 'pan-y' }}
          onClick={(e) => e.stopPropagation()}
        >
        {isTeam ? (
          <div className="w-full flex flex-col items-center select-none" style={{ touchAction: 'pan-y' }}>
            {/* As duas fotos da equipe exibidas lado a lado no próprio Lightbox */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-h-[56vh] sm:max-h-[60vh] w-full">
              <img
                src={currentItem.photos[0].src}
                alt={currentItem.photos[0].alt}
                width={currentItem.photos[0].width}
                height={currentItem.photos[0].height}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="max-h-[26vh] sm:max-h-[60vh] w-auto max-w-[95%] sm:max-w-[48%] object-contain rounded-xl shadow-2xl border border-[#2C2C2C] select-none pointer-events-none"
              />
              <img
                src={currentItem.photos[1].src}
                alt={currentItem.photos[1].alt}
                width={currentItem.photos[1].width}
                height={currentItem.photos[1].height}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="max-h-[26vh] sm:max-h-[60vh] w-auto max-w-[95%] sm:max-w-[48%] object-contain rounded-xl shadow-2xl border border-[#2C2C2C] select-none pointer-events-none"
              />
            </div>
            {/* Legenda Curta */}
            <div className="mt-3.5 text-center max-w-xl flex flex-col items-center px-4">
              <h3 className="text-sm sm:text-base font-bold text-[#F5F5F5]">{currentItem.caption}</h3>
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
              data-no-swipe="true"
              className="max-h-[56vh] sm:max-h-[60vh] w-auto max-w-full rounded-xl shadow-2xl bg-black border border-[#2C2C2C]"
            >
              Seu navegador não suporta a reprodução deste vídeo.
            </video>
            {/* Legenda Curta */}
            <div className="mt-3.5 text-center max-w-xl flex flex-col items-center px-4">
              <h3 className="text-sm sm:text-base font-bold text-[#F5F5F5]">{currentItem.title}</h3>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center select-none" style={{ touchAction: 'pan-y' }}>
            <img
              src={currentItem.src}
              alt={currentItem.alt}
              width={currentItem.width}
              height={currentItem.height}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="max-h-[56vh] sm:max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-[#2C2C2C] select-none pointer-events-none"
            />
            {/* Legenda Curta */}
            <div className="mt-3.5 text-center max-w-xl flex flex-col items-center px-4">
              <h3 className="text-sm sm:text-base font-bold text-[#F5F5F5]">{currentItem.caption}</h3>
            </div>
          </div>
        )}

        {/* Contador */}
        <div className="mt-2.5 text-xs text-[#737373] text-center">
          <span>{currentIndex + 1} de {items.length}</span>
          <span className="hidden sm:inline text-[#525252] mx-2">•</span>
          <span className="hidden sm:inline text-[#A3A3A3]">Deslize ou use as setas para navegar</span>
        </div>
      </div>
    </div>
  </div>,
  document.body
);
};
