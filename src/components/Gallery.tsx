import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Image as ImageIcon, Video as VideoIcon, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import {
  galleryAllSlides,
  galleryPhotosList,
  galleryVideosList,
  GalleryItem,
  GalleryTeamSlide,
  GalleryVideo,
} from '../data/gallery';
import { LightboxModal } from './LightboxModal';
import { trackEvent } from '../utils/analytics';

interface GalleryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

/**
 * Componente otimizado de imagem preguiçosa (Lazy Loading) para a galeria e carrossel.
 * Renderiza skeleton de carregamento e transição suave de fade-in ao completar o carregamento.
 */
const GalleryImage: React.FC<GalleryImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  containerClassName = '',
  style,
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
        onLoad={() => setIsLoaded(true)}
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Estados de animação e visibilidade no viewport
  const [isInViewport, setIsInViewport] = useState(false);
  const [isAutoGliding, setIsAutoGliding] = useState(false);

  const gallerySectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Refs de controle da animação contínua e toques no carrossel
  const isHoveredRef = useRef(false);
  const isInteractingRef = useRef(false);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRewindingRef = useRef(false);
  const subpixelAccumulatorRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const isDraggingCarouselRef = useRef(false);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Itens filtrados com base na seleção
  const filteredMedia: GalleryItem[] = React.useMemo(() => {
    if (filter === 'photos') return galleryPhotosList;
    if (filter === 'videos') return galleryVideosList;
    return galleryAllSlides;
  }, [filter]);

  // Observador de interseção: ativa movimento somente quando a galeria entra no viewport visível durante a rolagem
  useEffect(() => {
    const section = gallerySectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInViewport(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.2, // Pelo menos 20% visível na tela
      }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Pausa a animação automática ao interagir (toque, clique, teclado) e retoma após um intervalo ocioso
  const pauseAutoMotion = useCallback((delayMs = 3000) => {
    isInteractingRef.current = true;
    setIsAutoGliding(false);
    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
    }
    interactionTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      lastTimeRef.current = null;
    }, delayMs);
  }, []);

  // Loop de animação contínua, suave e sutil (da direita para a esquerda: scrollLeft cresce)
  useEffect(() => {
    if (shouldReduceMotion || !isInViewport || lightboxOpen) {
      setIsAutoGliding(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const carousel = carouselRef.current;
    if (!carousel) return;

    const SPEED_PX_PER_SEC = 28; // Velocidade sutil, suave e premium

    const step = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const deltaSeconds = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      const canAnimate =
        isInViewport &&
        !isHoveredRef.current &&
        !isInteractingRef.current &&
        !isRewindingRef.current &&
        !lightboxOpen &&
        !shouldReduceMotion;

      if (canAnimate && carousel) {
        setIsAutoGliding(true);
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;

        if (maxScroll > 10) {
          if (carousel.scrollLeft >= maxScroll - 2) {
            // Fim da galeria: pausa e retorna suavemente ao início
            isRewindingRef.current = true;
            setIsAutoGliding(false);

            setTimeout(() => {
              if (carouselRef.current) {
                carouselRef.current.scrollTo({
                  left: 0,
                  behavior: 'smooth',
                });
              }

              // Espera o retorno suave concluir antes de reiniciar
              setTimeout(() => {
                isRewindingRef.current = false;
                lastTimeRef.current = null;
                subpixelAccumulatorRef.current = 0;
              }, 1200);
            }, 2200);
          } else {
            subpixelAccumulatorRef.current += SPEED_PX_PER_SEC * deltaSeconds;
            if (Math.abs(subpixelAccumulatorRef.current) >= 1) {
              const movePx = Math.trunc(subpixelAccumulatorRef.current);
              carousel.scrollLeft += movePx;
              subpixelAccumulatorRef.current -= movePx;
            }
          }
        }
      } else {
        setIsAutoGliding(false);
      }

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [isInViewport, lightboxOpen, shouldReduceMotion]);

  // Atualiza estado das setas de navegação e barra de progresso
  const updateScrollStatus = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < maxScroll - 6);

    if (maxScroll > 0) {
      const progress = Math.min(Math.max((scrollLeft / maxScroll) * 100, 0), 100);
      setScrollProgress(progress);
    } else {
      setScrollProgress(0);
    }

    if (scrollLeft > 20 && !hasScrolled) {
      setHasScrolled(true);
    }
  }, [hasScrolled]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    updateScrollStatus();
    el.addEventListener('scroll', updateScrollStatus, { passive: true });
    window.addEventListener('resize', updateScrollStatus);

    return () => {
      el.removeEventListener('scroll', updateScrollStatus);
      window.removeEventListener('resize', updateScrollStatus);
    };
  }, [updateScrollStatus, filteredMedia]);

  // Ao trocar o filtro, a faixa retorna ao início
  const handleFilterChange = (newFilter: 'all' | 'photos' | 'videos') => {
    pauseAutoMotion(2000);
    setFilter(newFilter);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: 0,
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
      });
    }
  };

  // Rolagem por botões: largura visível * 0.8
  const handleScrollClick = (direction: 'left' | 'right') => {
    pauseAutoMotion(3500);
    const el = carouselRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.8;
    const targetScroll = direction === 'left' ? -scrollAmount : scrollAmount;

    el.scrollBy({
      left: targetScroll,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  };

  const handleOpenMedia = (item: GalleryItem, element: HTMLElement) => {
    // Se o usuário estava arrastando/deslizando o carrossel no celular, não abre o modal acidentalmente
    if (isDraggingCarouselRef.current) return;
    pauseAutoMotion(1000);
    triggerRef.current = element;
    const index = filteredMedia.findIndex((m) => m.id === item.id);
    setActiveMediaIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
    trackEvent('gallery_open', { media_id: item.id, type: item.type });
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    pauseAutoMotion(2000);
    if (triggerRef.current) {
      triggerRef.current.focus({ preventScroll: true });
    }
  };

  return (
    <section
      id="galeria"
      ref={gallerySectionRef}
      aria-labelledby="gallery-title"
      className="py-12 md:py-16 bg-[#0E0E0E] border-b border-[#2C2C2C] relative"
    >
      {/* Âncora alternativa para #fotos */}
      <div id="fotos" className="sr-only" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho enxuto: título + 1 linha de texto */}
        <div className="max-w-3xl mx-auto text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-2 block">
            Nossa Oficina
          </span>
          <h2
            id="gallery-title"
            className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase text-[#F5F5F5] tracking-tight mb-2"
          >
            Estrutura real, processos técnicos e equipe dedicada
          </h2>
          <p className="text-sm sm:text-base text-[#A3A3A3] leading-relaxed">
            Fotos e vídeos reais da oficina, da equipe e do nosso trabalho em Mailasqui.
          </p>
        </div>

        {/* Filtros compactos: Todos / Fotos / Vídeos */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1 p-1 bg-[#1A1A1A] border border-[#2C2C2C] rounded-xl">
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F97316] ${
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F97316] ${
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F97316] ${
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

        {/* Container do Carrossel com botões de navegação e fade lateral */}
        <div className="relative group/carousel">
          {/* Botão Anterior (44x44px, circular, #F97316) */}
          <button
            type="button"
            onClick={() => handleScrollClick('left')}
            disabled={!canScrollLeft}
            aria-disabled={!canScrollLeft}
            aria-label="Ver mídias anteriores"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-[#F97316]"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
          </button>

          {/* Botão Próximo (44x44px, circular, #F97316) */}
          <button
            type="button"
            onClick={() => handleScrollClick('right')}
            disabled={!canScrollRight}
            aria-disabled={!canScrollRight}
            aria-label="Ver próximas mídias"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-[#F97316]"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
          </button>

          {/* Fade lateral sutil para indicar continuidade de conteúdo */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#0E0E0E] to-transparent pointer-events-none z-20 transition-opacity duration-300 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
          <div
            className={`absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#0E0E0E] to-transparent pointer-events-none z-20 transition-opacity duration-300 ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />

          {/* Faixa única horizontal com animação suave e suporte a toque */}
          <div
            ref={carouselRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Galeria de fotos e vídeos da Garagem Mailasque"
            tabIndex={0}
            onMouseEnter={() => {
              isHoveredRef.current = true;
              setIsAutoGliding(false);
            }}
            onMouseLeave={() => {
              isHoveredRef.current = false;
            }}
            onTouchStart={(e) => {
              pauseAutoMotion(10000);
              if (e.touches[0]) {
                dragStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
              }
              isDraggingCarouselRef.current = false;
            }}
            onTouchMove={(e) => {
              if (dragStartPosRef.current && e.touches[0]) {
                const deltaX = Math.abs(e.touches[0].clientX - dragStartPosRef.current.x);
                const deltaY = Math.abs(e.touches[0].clientY - dragStartPosRef.current.y);
                if (deltaX > 8 || deltaY > 8) {
                  isDraggingCarouselRef.current = true;
                }
              }
            }}
            onTouchEnd={() => {
              pauseAutoMotion(2500);
              dragStartPosRef.current = null;
              setTimeout(() => {
                isDraggingCarouselRef.current = false;
              }, 120);
            }}
            onTouchCancel={() => {
              pauseAutoMotion(2500);
              dragStartPosRef.current = null;
              isDraggingCarouselRef.current = false;
            }}
            onPointerDown={() => {
              pauseAutoMotion(10000);
            }}
            onPointerUp={() => {
              pauseAutoMotion(2500);
            }}
            className={`flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2 px-1 focus-visible:outline-1 focus-visible:outline-[#F97316] ${
              isAutoGliding ? 'scroll-auto' : 'snap-x snap-mandatory scroll-smooth'
            }`}
          >
            {filteredMedia.map((item, index) => {
              const isVideo = item.type === 'video';
              const isTeam = item.type === 'team';

              let label = '';
              if (isVideo) {
                label = `Assistir vídeo: ${(item as GalleryVideo).title}`;
              } else if (isTeam) {
                label = `Ampliar fotos da equipe: ${(item as GalleryTeamSlide).caption}`;
              } else {
                label = `Ampliar foto: ${item.caption}`;
              }

              return (
                <div
                  key={item.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Slide ${index + 1} de ${filteredMedia.length}: ${isTeam ? item.caption : isVideo ? (item as GalleryVideo).title : item.caption}`}
                  className="snap-start shrink-0 h-[240px] sm:h-[300px] lg:h-[360px]"
                >
                  <button
                    type="button"
                    onClick={(e) => handleOpenMedia(item, e.currentTarget)}
                    onFocus={(e) => {
                      if (carouselRef.current && e.currentTarget.matches(':focus-visible')) {
                        const carousel = carouselRef.current;
                        const button = e.currentTarget;
                        const carouselRect = carousel.getBoundingClientRect();
                        const buttonRect = button.getBoundingClientRect();
                        if (buttonRect.left < carouselRect.left) {
                          carousel.scrollLeft += (buttonRect.left - carouselRect.left) - 16;
                        } else if (buttonRect.right > carouselRect.right) {
                          carousel.scrollLeft += (buttonRect.right - carouselRect.right) + 16;
                        }
                      }
                    }}
                    className="group relative h-full rounded-2xl overflow-hidden bg-[#171717] border border-[#2C2C2C] hover:border-[#F97316] transition-all duration-200 cursor-pointer text-left p-0 block shadow-md focus-visible:outline-2 focus-visible:outline-[#F97316]"
                    aria-label={label}
                  >
                    {/* Caso 1: Slide unificado da equipe com as duas fotos lado a lado */}
                    {isTeam ? (
                      <div className="flex flex-row items-center gap-2 h-full p-2 bg-[#1A1A1A] relative">
                        <GalleryImage
                          src={(item as GalleryTeamSlide).photos[0].src}
                          alt={(item as GalleryTeamSlide).photos[0].alt}
                          width={(item as GalleryTeamSlide).photos[0].width}
                          height={(item as GalleryTeamSlide).photos[0].height}
                          containerClassName="h-full rounded-xl overflow-hidden"
                          className="h-full w-auto object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                          style={{
                            aspectRatio: `${(item as GalleryTeamSlide).photos[0].width} / ${(item as GalleryTeamSlide).photos[0].height}`,
                          }}
                        />
                        <GalleryImage
                          src={(item as GalleryTeamSlide).photos[1].src}
                          alt={(item as GalleryTeamSlide).photos[1].alt}
                          width={(item as GalleryTeamSlide).photos[1].width}
                          height={(item as GalleryTeamSlide).photos[1].height}
                          containerClassName="h-full rounded-xl overflow-hidden"
                          className="h-full w-auto object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                          style={{
                            aspectRatio: `${(item as GalleryTeamSlide).photos[1].width} / ${(item as GalleryTeamSlide).photos[1].height}`,
                          }}
                        />

                        {/* Scrim gradiente para legibilidade da legenda unificada */}
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none rounded-2xl"
                          aria-hidden="true"
                        />

                        {/* Badge de Foto */}
                        <div className="absolute top-4 left-4 z-10 pointer-events-none">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-black/75 text-[#F5F5F5] backdrop-blur-sm border border-white/10 shadow-sm">
                            <ImageIcon className="w-3 h-3 text-[#C9CDD2]" aria-hidden="true" />
                            <span>Fotos da Equipe</span>
                          </span>
                        </div>

                        {/* Ícone de expansão central no hover */}
                        <div
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
                          aria-hidden="true"
                        >
                          <div className="w-12 h-12 rounded-full bg-[#F97316] text-[#0A0A0A] flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                            <Maximize2 className="w-5 h-5" />
                          </div>
                        </div>

                        {/* Legenda unificada da equipe */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-left z-10 pointer-events-none">
                          <p className="text-sm font-bold text-[#F5F5F5] line-clamp-1">{item.caption}</p>
                        </div>
                      </div>
                    ) : (
                      /* Caso 2: Foto individual ou Vídeo individual */
                      <div
                        className="h-full overflow-hidden bg-[#1A1A1A] relative"
                        style={{ aspectRatio: `${item.width} / ${item.height}` }}
                      >
                        {isVideo ? (
                          <GalleryImage
                            src={(item as GalleryVideo).poster}
                            alt={`Capa do vídeo: ${(item as GalleryVideo).title}`}
                            width={item.width}
                            height={item.height}
                            containerClassName="h-full w-full"
                            className="h-full w-auto object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <GalleryImage
                            src={item.src}
                            alt={item.alt}
                            width={item.width}
                            height={item.height}
                            containerClassName="h-full w-full"
                            className="h-full w-auto object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}

                        {/* Scrim gradiente para legibilidade das legendas */}
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none"
                          aria-hidden="true"
                        />

                        {/* Badge de Tipo */}
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

                        {/* Legenda inferior */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-left z-10 pointer-events-none">
                          {isVideo ? (
                            <p className="text-sm font-bold text-[#F5F5F5] line-clamp-1">
                              {(item as GalleryVideo).title}
                            </p>
                          ) : (
                            <p className="text-sm font-bold text-[#F5F5F5] line-clamp-1">{item.caption}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicador de posição e instrução sutil */}
        <div className="mt-4 flex flex-col items-center justify-center">
          {/* Barra de progresso fina (h-1, trilho #2C2C2C, preenchimento #F97316) */}
          <div
            className="w-48 sm:w-64 h-1 bg-[#2C2C2C] rounded-full overflow-hidden"
            role="progressbar"
            aria-label="Posição do carrossel da galeria"
            aria-valuenow={Math.round(scrollProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-[#F97316] transition-all duration-100 ease-out"
              style={{ width: `${Math.max(scrollProgress, 8)}%` }}
            />
          </div>

          <p
            className={`text-xs text-[#737373] text-center mt-2 select-none transition-opacity duration-300 ${
              hasScrolled ? 'md:opacity-0' : 'opacity-100'
            }`}
          >
            Deslize para ver mais
          </p>
        </div>
      </div>

      {/* Modal Lightbox */}
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
