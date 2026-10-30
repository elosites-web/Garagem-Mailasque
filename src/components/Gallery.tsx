import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Play, Image as ImageIcon, Video as VideoIcon, Maximize2, ChevronLeft, ChevronRight, MousePointer2 } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import {
  galleryAllSlides,
  galleryPhotosList,
  galleryVideosList,
  GalleryItem,
  GalleryPhoto,
  GalleryTeamSlide,
  GalleryVideo,
} from '../data/gallery';
import { LightboxModal } from './LightboxModal';
import { trackEvent } from '../utils/analytics';
import {
  calculateGalleryOverflow,
  calculateScrollProgress,
  calculateStickyHeight,
} from '../utils/gallery-scroll';

interface GalleryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  onImageLoad?: () => void;
}

/**
 * Componente otimizado de imagem preguiçosa (Lazy Loading) para a galeria.
 * Renderiza skeleton de carregamento e transição suave de fade-in ao carregar.
 */
const GalleryImage: React.FC<GalleryImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  containerClassName = '',
  style,
  onImageLoad,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-[#1A1A1A] ${containerClassName}`} style={style}>
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-[#222222] animate-pulse pointer-events-none z-0"
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => {
          setIsLoaded(true);
          onImageLoad?.();
        }}
        className={`${className} transition-opacity duration-500 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};

export const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'photos' | 'videos'>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Estados do scroll vertical conduzindo o movimento horizontal
  const [progress, setProgress] = useState(0); // 0 a 1
  const [maxTranslateX, setMaxTranslateX] = useState(0);
  const [scrollDistance, setScrollDistance] = useState(0);
  const [isStickyActive, setIsStickyActive] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackContainerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Touch tracking para evitar clique acidental durante arraste no celular
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  // Lista filtrada
  const filteredMedia: GalleryItem[] = useMemo(() => {
    if (filter === 'photos') return galleryPhotosList;
    if (filter === 'videos') return galleryVideosList;
    return galleryAllSlides;
  }, [filter]);

  // Recalcula dimensões e limites exatos da trilha horizontal com base no conteúdo real
  const calculateDimensions = useCallback(() => {
    if (shouldReduceMotion) {
      setMaxTranslateX(0);
      setScrollDistance(0);
      return;
    }

    const track = trackRef.current;
    const trackContainer = trackContainerRef.current || stickyRef.current;
    if (!track || !trackContainer) return;

    // Distância horizontal necessária para revelar o último item com margem de respiro
    const overflow = calculateGalleryOverflow({
      trackScrollWidth: track.scrollWidth,
      containerVisibleWidth: trackContainer.clientWidth,
    });

    setMaxTranslateX(overflow);

    // Mapeamento 1:1 entre distância vertical de rolagem e avanço horizontal
    // Garante ritmo natural sem retenção excessiva nem saltos visuais
    const calculatedDistance = Math.round(overflow);
    setScrollDistance(calculatedDistance);
  }, [shouldReduceMotion]);

  // Atualiza o progresso de rolagem conforme a posição vertical da seção na viewport
  const updateScrollProgress = useCallback(() => {
    if (shouldReduceMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const totalScrollable = container.offsetHeight - viewportHeight;

    const currentProgress = calculateScrollProgress({
      rectTop: rect.top,
      totalScrollable,
    });

    setProgress(currentProgress);
    setIsStickyActive(rect.top <= 0 && rect.bottom >= viewportHeight);
  }, [shouldReduceMotion]);

  // Observador de redimensionamento e scroll de alta performance com requestAnimationFrame
  useEffect(() => {
    calculateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      calculateDimensions();
      updateScrollProgress();
    });

    if (trackRef.current) resizeObserver.observe(trackRef.current);
    if (stickyRef.current) resizeObserver.observe(stickyRef.current);

    const handleWindowResize = () => {
      calculateDimensions();
      updateScrollProgress();
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [calculateDimensions, updateScrollProgress, filteredMedia]);

  // Listener de rolagem vertical da página
  useEffect(() => {
    if (shouldReduceMotion) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [shouldReduceMotion, updateScrollProgress, scrollDistance]);

  // Ao trocar filtro: recalcula dimensões e reposiciona suavemente
  const handleFilterChange = (newFilter: 'all' | 'photos' | 'videos') => {
    setFilter(newFilter);
    // Força recálculo imediato no próximo frame
    requestAnimationFrame(() => {
      calculateDimensions();
      updateScrollProgress();
    });
  };

  // Navegação por setas: avança ou retrocede a rolagem vertical de forma suave
  const handleArrowNavigation = (direction: 'prev' | 'next') => {
    if (shouldReduceMotion) {
      const track = trackRef.current;
      if (!track) return;
      const step = track.clientWidth * 0.75;
      track.scrollBy({
        left: direction === 'next' ? step : -step,
        behavior: 'smooth',
      });
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const viewportHeight = window.innerHeight;
    const totalScrollable = container.offsetHeight - viewportHeight;
    if (totalScrollable <= 0) return;

    // Rola verticalmente a distância proporcional a 1 card
    const stepSize = Math.max(viewportHeight * 0.45, totalScrollable / Math.max(filteredMedia.length, 1));
    const targetDelta = direction === 'next' ? stepSize : -stepSize;

    window.scrollBy({
      top: targetDelta,
      behavior: 'smooth',
    });
  };

  // Suporte a foco pelo teclado em cada card (Tab)
  const handleCardFocus = (index: number) => {
    if (shouldReduceMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const viewportHeight = window.innerHeight;
    const totalScrollable = container.offsetHeight - viewportHeight;
    if (totalScrollable <= 0) return;

    const itemRatio = filteredMedia.length > 1 ? index / (filteredMedia.length - 1) : 0;
    const containerTop = window.scrollY + container.getBoundingClientRect().top;
    const targetScrollY = containerTop + (itemRatio * totalScrollable);

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    });
  };

  const handleOpenMedia = (item: GalleryItem, element: HTMLElement) => {
    if (isDraggingRef.current) return;
    triggerRef.current = element;
    const index = filteredMedia.findIndex((m) => m.id === item.id);
    setActiveMediaIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
    trackEvent('gallery_open', { media_id: item.id, type: item.type });
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    if (triggerRef.current) {
      triggerRef.current.focus({ preventScroll: true });
    }
  };

  // Deslocamento horizontal exato do trilho em pixels baseado na rolagem vertical
  const currentTranslateX = shouldReduceMotion ? 0 : progress * maxTranslateX;

  // Altura total do container externo necessária para a rolagem vertical
  const containerHeightStyle = calculateStickyHeight({
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
    scrollDistance,
    isReducedMotion: shouldReduceMotion ?? false,
  });

  return (
    <section
      id="galeria"
      ref={containerRef}
      style={{ minHeight: containerHeightStyle }}
      aria-labelledby="gallery-title"
      className="relative bg-[#0E0E0E] border-b border-[#2C2C2C]"
    >
      {/* Âncora alternativa para #fotos */}
      <div id="fotos" className="sr-only" aria-hidden="true" />

      {/* Conteúdo da Galeria:
          Em modo padrão, 'sticky top-0 h-screen' fixa a galeria enquanto a rolagem vertical controla o movimento horizontal.
          Em modo reduced-motion, torna-se estático com rolagem horizontal nativa acessível. */}
      <div
        ref={stickyRef}
        className={
          shouldReduceMotion
            ? 'py-12 md:py-16'
            : 'sticky top-0 h-[100dvh] w-full overflow-hidden flex flex-col justify-between py-5 sm:py-6 lg:py-8'
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full shrink-0">
          {/* Cabeçalho enxuto: título + 1 linha de texto */}
          <div className="max-w-3xl mx-auto text-center mb-3 sm:mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-1.5 block">
              Nossa Oficina
            </span>
            <h2
              id="gallery-title"
              className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase text-[#F5F5F5] tracking-tight mb-1"
            >
              Estrutura real, processos técnicos e equipe dedicada
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              Fotos e vídeos reais da oficina, da equipe e do nosso trabalho em Mailasqui.
            </p>
          </div>

          {/* Filtros compactos: Todos / Fotos / Vídeos */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-1 p-1 bg-[#1A1A1A] border border-[#2C2C2C] rounded-xl">
              <button
                type="button"
                onClick={() => handleFilterChange('all')}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F97316] ${
                  filter === 'all'
                    ? 'bg-[#F97316] text-[#0A0A0A] shadow-sm'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#262626]'
                }`}
              >
                Todos ({galleryAllSlides.length})
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('photos')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F97316] ${
                  filter === 'photos'
                    ? 'bg-[#F97316] text-[#0A0A0A] shadow-sm'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#262626]'
                }`}
              >
                <ImageIcon className="w-3 h-3" aria-hidden="true" />
                <span>Fotos ({galleryPhotosList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('videos')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F97316] ${
                  filter === 'videos'
                    ? 'bg-[#F97316] text-[#0A0A0A] shadow-sm'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#262626]'
                }`}
              >
                <VideoIcon className="w-3 h-3" aria-hidden="true" />
                <span>Vídeos ({galleryVideosList.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trilho Horizontal de Fotos e Vídeos */}
        <div
          ref={trackContainerRef}
          className="relative w-full overflow-hidden flex-1 flex items-center my-auto min-h-0"
        >
          {/* Botão Anterior */}
          <button
            type="button"
            onClick={() => handleArrowNavigation('prev')}
            disabled={progress <= 0.01}
            aria-disabled={progress <= 0.01}
            aria-label="Ver mídias anteriores"
            className="absolute left-2 sm:left-4 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-[#F97316]"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" aria-hidden="true" />
          </button>

          {/* Botão Próximo */}
          <button
            type="button"
            onClick={() => handleArrowNavigation('next')}
            disabled={progress >= 0.99}
            aria-disabled={progress >= 0.99}
            aria-label="Ver próximas mídias"
            className="absolute right-2 sm:right-4 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-[#F97316]"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" aria-hidden="true" />
          </button>

          {/* Fades sutis nas extremidades */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#0E0E0E] to-transparent pointer-events-none z-20 transition-opacity duration-300 ${
              progress > 0.02 ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
          <div
            className={`absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#0E0E0E] to-transparent pointer-events-none z-20 transition-opacity duration-300 ${
              progress < 0.98 ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />

          {/* Faixa transladada horizontalmente pela rolagem da página */}
          <div
            ref={trackRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Fotos e vídeos da oficina Garagem Mailasque"
            onTouchStart={(e) => {
              if (e.touches[0]) {
                touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
              }
              isDraggingRef.current = false;
            }}
            onTouchMove={(e) => {
              if (touchStartRef.current && e.touches[0]) {
                const deltaX = Math.abs(e.touches[0].clientX - touchStartRef.current.x);
                const deltaY = Math.abs(e.touches[0].clientY - touchStartRef.current.y);
                if (deltaX > 8 || deltaY > 8) {
                  isDraggingRef.current = true;
                }
              }
            }}
            onTouchEnd={() => {
              touchStartRef.current = null;
              setTimeout(() => {
                isDraggingRef.current = false;
              }, 100);
            }}
            style={
              shouldReduceMotion
                ? undefined
                : {
                    transform: `translate3d(-${currentTranslateX}px, 0, 0)`,
                    willChange: 'transform',
                  }
            }
            className={
              shouldReduceMotion
                ? 'flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2 px-6 sm:px-12 snap-x snap-mandatory'
                : 'flex gap-4 sm:gap-6 py-2 px-6 sm:px-12 lg:px-16 w-max transition-transform duration-75 ease-out select-none'
            }
          >
            {filteredMedia.map((item, index) => {
              const isVideo = item.type === 'video';
              const isTeam = item.type === 'team';
              const videoItem = isVideo ? (item as GalleryVideo) : null;
              const photoItem = !isVideo && !isTeam ? (item as GalleryPhoto) : null;
              const teamItem = isTeam ? (item as GalleryTeamSlide) : null;

              const caption = videoItem
                ? videoItem.title
                : teamItem
                ? teamItem.caption
                : photoItem?.caption || '';

              const buttonLabel = isVideo
                ? `Assistir vídeo: ${caption}`
                : `Ampliar foto: ${caption}`;

              const itemWidth = videoItem?.width || photoItem?.width || 16;
              const itemHeight = videoItem?.height || photoItem?.height || 9;

              return (
                <div
                  key={item.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Item ${index + 1} de ${filteredMedia.length}: ${caption}`}
                  className="shrink-0 h-[40vh] min-h-[220px] max-h-[380px] sm:max-h-[420px]"
                >
                  <button
                    type="button"
                    onClick={(e) => handleOpenMedia(item, e.currentTarget)}
                    onFocus={() => handleCardFocus(index)}
                    className="group relative h-full rounded-2xl overflow-hidden bg-[#171717] border border-[#2C2C2C] hover:border-[#F97316] transition-all duration-200 cursor-pointer text-left p-0 block shadow-xl focus-visible:outline-2 focus-visible:outline-[#F97316]"
                    aria-label={buttonLabel}
                  >
                    <div
                      className="h-full overflow-hidden bg-[#1A1A1A] relative"
                      style={{ aspectRatio: `${itemWidth} / ${itemHeight}` }}
                    >
                      {isVideo && videoItem ? (
                        <GalleryImage
                          src={videoItem.poster}
                          alt={caption}
                          width={videoItem.width}
                          height={videoItem.height}
                          onImageLoad={calculateDimensions}
                          containerClassName="h-full w-full"
                          className="h-full w-auto object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : photoItem ? (
                        <GalleryImage
                          src={photoItem.src}
                          alt={photoItem.alt}
                          width={photoItem.width}
                          height={photoItem.height}
                          onImageLoad={calculateDimensions}
                          containerClassName="h-full w-full"
                          className="h-full w-auto object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : null}

                      {/* Scrim gradiente para garantir legibilidade impecável das legendas curtas */}
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none"
                        aria-hidden="true"
                      />

                      {/* Badge discreto de tipo */}
                      <div className="absolute top-3 left-3 z-10 pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-black/75 text-[#F5F5F5] backdrop-blur-sm border border-white/10 shadow-sm">
                          {isVideo ? (
                            <>
                              <Play className="w-3 h-3 text-[#F97316] fill-current" aria-hidden="true" />
                              <span>Vídeo</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3 h-3 text-[#C9CDD2]" aria-hidden="true" />
                              <span>Foto</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Ícone central no hover */}
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
                        aria-hidden="true"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#F97316] text-[#0A0A0A] flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                          {isVideo ? (
                            <Play className="w-5 h-5 fill-current translate-x-0.5" />
                          ) : (
                            <Maximize2 className="w-5 h-5" />
                          )}
                        </div>
                      </div>

                      {/* Legenda curta e factual no rodapé do card */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-left z-10 pointer-events-none">
                        <p className="text-sm font-bold text-[#F5F5F5] line-clamp-1">
                          {caption}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barra de Progresso e Dica de Rolagem Vertical */}
        <div className="shrink-0 max-w-7xl mx-auto px-4 w-full flex flex-col items-center justify-center pt-2">
          {/* Barra de progresso contínua */}
          <div
            className="w-48 sm:w-64 h-1 bg-[#2C2C2C] rounded-full overflow-hidden"
            role="progressbar"
            aria-label="Progresso da galeria horizontal"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-[#F97316] transition-all duration-75 ease-out"
              style={{ width: `${Math.max(progress * 100, 6)}%` }}
            />
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-[#737373] select-none">
            <MousePointer2 className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
            <span>Role a página para navegar na galeria</span>
            <span className="text-[#525252]">•</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Modal Lightbox com as mesmas legendas curtas e sem anúncios */}
      <LightboxModal
        items={filteredMedia}
        currentIndex={activeMediaIndex}
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
        onNavigate={(newIndex) => setActiveMediaIndex(newIndex)}
      />
    </section>
  );
};
