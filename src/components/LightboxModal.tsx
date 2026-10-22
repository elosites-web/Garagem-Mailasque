import React, { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { GalleryPhoto, GalleryVideo } from '../data/gallery';

export type GalleryItem = GalleryPhoto | GalleryVideo;

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

  // Teclado: Escape fecha, setas navegam
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < items.length - 1) {
          onNavigate(currentIndex + 1);
        } else {
          onNavigate(0);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          onNavigate(currentIndex - 1);
        } else {
          onNavigate(items.length - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length, onClose, onNavigate]);

  // Foco inicial
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!isOpen || !currentItem) return null;

  const isVideo = currentItem.type === 'video';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isVideo ? (currentItem as GalleryVideo).title : (currentItem as GalleryPhoto).caption}
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
        {isVideo ? (
          <div className="w-full flex flex-col items-center">
            <video
              key={currentItem.src}
              src={currentItem.src}
              controls
              playsInline
              preload="metadata"
              poster={(currentItem as GalleryVideo).poster}
              className="max-h-[70vh] w-auto max-w-full rounded-xl shadow-2xl bg-black border border-[#2C2C2C]"
            >
              Seu navegador não suporta a reprodução deste vídeo.
            </video>
            <div className="mt-4 text-center">
              <h3 className="text-base font-bold text-[#F5F5F5]">{(currentItem as GalleryVideo).title}</h3>
              <p className="text-xs text-[#A3A3A3] mt-1">{(currentItem as GalleryVideo).description}</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <img
              src={currentItem.src}
              alt={(currentItem as GalleryPhoto).alt}
              className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-[#2C2C2C]"
            />
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-[#F5F5F5]">{(currentItem as GalleryPhoto).caption}</p>
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
