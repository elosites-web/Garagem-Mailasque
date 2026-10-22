import React, { useState } from 'react';
import { Play, Image as ImageIcon, Video as VideoIcon, Maximize2 } from 'lucide-react';
import { galleryPhotos, galleryVideos } from '../data/gallery';
import { LightboxModal, GalleryItem } from './LightboxModal';
import { trackEvent } from '../utils/analytics';

export const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'photos' | 'videos'>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Combina mídias para visualização
  const allMedia: GalleryItem[] = [...galleryPhotos, ...galleryVideos];

  const filteredMedia = allMedia.filter((item) => {
    if (filter === 'photos') return item.type === 'image';
    if (filter === 'videos') return item.type === 'video';
    return true;
  });

  const handleOpenMedia = (item: GalleryItem) => {
    const originalIndex = allMedia.findIndex((m) => m.id === item.id);
    setActiveMediaIndex(originalIndex >= 0 ? originalIndex : 0);
    setLightboxOpen(true);
    trackEvent('gallery_open', { media_id: item.id, type: item.type });
  };

  return (
    <section
      id="galeria"
      aria-labelledby="gallery-title"
      className="py-20 md:py-28 bg-[#0E0E0E] border-b border-[#2C2C2C] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-3 block">
            Nossa Oficina
          </span>
          <h2
            id="gallery-title"
            className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase text-[#F5F5F5] tracking-tight mb-4"
          >
            Estrutura real, processos técnicos e equipe dedicada
          </h2>
          <p className="text-base text-[#A3A3A3] leading-relaxed">
            Conheça as instalações da Garagem Mailasque em Mailasqui. Fotos autênticas e registros dos nossos processos diários de funilaria e pintura.
          </p>
        </div>

        {/* Controles de Filtro Interativos (Botões acessíveis, sem pills vazias) */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1 bg-[#1A1A1A] border border-[#2C2C2C] rounded-xl">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F97316] ${
                filter === 'all'
                  ? 'bg-[#F97316] text-[#0A0A0A] shadow-sm'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#262626]'
              }`}
            >
              Todos ({allMedia.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('photos')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F97316] ${
                filter === 'photos'
                  ? 'bg-[#F97316] text-[#0A0A0A] shadow-sm'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#262626]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Fotos ({galleryPhotos.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('videos')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F97316] ${
                filter === 'videos'
                  ? 'bg-[#F97316] text-[#0A0A0A] shadow-sm'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#262626]'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Vídeos ({galleryVideos.length})</span>
            </button>
          </div>
        </div>

        {/* Grid de Mídia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item) => {
            const isVideo = item.type === 'video';
            const thumbnailSrc = isVideo ? (item as any).poster : item.src;
            const titleOrAlt = isVideo ? (item as any).title : (item as any).caption;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenMedia(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenMedia(item);
                  }
                }}
                role="button"
                tabIndex={0}
                className="group relative rounded-2xl overflow-hidden bg-[#171717] border border-[#2C2C2C] cursor-pointer hover:border-[#F97316] transition-all duration-200 hover:-translate-y-1 shadow-md focus-visible:outline-2 focus-visible:outline-[#F97316]"
                aria-label={isVideo ? `Assistir vídeo: ${titleOrAlt}` : `Ampliar foto: ${titleOrAlt}`}
              >
                {/* Imagem / Poster */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#1A1A1A]">
                  <img
                    src={thumbnailSrc}
                    alt={titleOrAlt}
                    width={640}
                    height={480}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Scrim permanente e hover */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"
                  aria-hidden="true"
                />

                {/* Badge Discreto de Tipo */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-black/70 text-[#F5F5F5] backdrop-blur-sm border border-white/10">
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

                {/* Botão de expansão / play central no hover */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  aria-hidden="true"
                >
                  <div className="w-14 h-14 rounded-full bg-[#F97316] text-[#0A0A0A] flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                    {isVideo ? (
                      <Play className="w-6 h-6 fill-current translate-x-0.5" />
                    ) : (
                      <Maximize2 className="w-6 h-6" />
                    )}
                  </div>
                </div>

                {/* Legenda Inferior */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-left z-10">
                  <p className="text-sm font-bold text-[#F5F5F5] line-clamp-1">{titleOrAlt}</p>
                  {isVideo && (
                    <p className="text-xs text-[#A3A3A3] mt-0.5 line-clamp-1">
                      {(item as any).description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Nota de rodapé da galeria */}
        <div className="mt-12 text-center text-xs text-[#737373]">
          Todas as fotos e filmagens retratam exclusivamente a estrutura e trabalhos executados na Garagem Mailasque.
        </div>
      </div>

      {/* Modal Lightbox */}
      <LightboxModal
        items={allMedia}
        currentIndex={activeMediaIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(newIndex) => setActiveMediaIndex(newIndex)}
      />
    </section>
  );
};
