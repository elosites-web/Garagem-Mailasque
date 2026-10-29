export interface GalleryPhoto {
  id: string;
  type: 'image';
  src: string;
  alt: string;
  caption: string;
  serviceName?: string;
  category: 'instalacoes' | 'equipe';
  width: number;
  height: number;
}

export interface TeamPhotoItem {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface GalleryTeamSlide {
  id: string;
  type: 'team';
  caption: string;
  serviceName?: string;
  category: 'equipe';
  photos: [TeamPhotoItem, TeamPhotoItem];
}

export interface GalleryVideo {
  id: string;
  type: 'video';
  src: string;
  poster: string;
  width: number;
  height: number;
  title: string;
  description: string;
  serviceName?: string;
}

export type GalleryItem = GalleryPhoto | GalleryTeamSlide | GalleryVideo;

export const galleryPhotosList: (GalleryPhoto | GalleryTeamSlide)[] = [
  {
    id: 'estacionamento',
    type: 'image',
    src: '/assets/garagemailasque/estacionamento.jpeg',
    width: 925,
    height: 583,
    alt: 'Estacionamento da Garagem Mailasque',
    caption: 'Estacionamento',
    category: 'instalacoes',
  },
  {
    id: 'recepcao',
    type: 'image',
    src: '/assets/garagemailasque/recepcao.jpeg',
    width: 1086,
    height: 1417,
    alt: 'Recepção da Garagem Mailasque',
    caption: 'Recepção',
    category: 'instalacoes',
  },
  {
    id: 'estufa-pintura',
    type: 'image',
    src: '/assets/garagemailasque/camara-de-pintura.jpeg',
    width: 1027,
    height: 1011,
    alt: 'Estufa de pintura da Garagem Mailasque',
    caption: 'Estufa de pintura',
    category: 'instalacoes',
  },
  {
    id: 'equipe-1',
    type: 'image',
    src: '/assets/garagemailasque/equipe1.jpeg',
    width: 1254,
    height: 787,
    alt: 'Equipe Garagem Mailasque',
    caption: 'Equipe Garagem Mailasque',
    category: 'equipe',
  },
  {
    id: 'equipe-2',
    type: 'image',
    src: '/assets/garagemailasque/equipe2.jpeg',
    width: 828,
    height: 500,
    alt: 'Equipe Garagem Mailasque',
    caption: 'Equipe Garagem Mailasque',
    category: 'equipe',
  },
];

export const galleryVideosList: GalleryVideo[] = [
  {
    id: 'video-1',
    type: 'video',
    src: '/assets/garagemailasque/garagem-video1.mp4',
    poster: '/assets/garagemailasque/posters/garagem-video1-poster.jpg',
    width: 1280,
    height: 720,
    title: 'Profissional trabalhando',
    description: '',
  },
  {
    id: 'video-2',
    type: 'video',
    src: '/assets/garagemailasque/video-02.mp4',
    poster: '/assets/garagemailasque/posters/video-02-poster.jpg',
    width: 576,
    height: 768,
    title: 'Profissional trabalhando',
    description: '',
  },
  {
    id: 'video-3',
    type: 'video',
    src: '/assets/garagemailasque/video-03.mp4',
    poster: '/assets/garagemailasque/posters/video-03-poster.jpg',
    width: 576,
    height: 768,
    title: 'Profissional trabalhando',
    description: '',
  },
  {
    id: 'video-4',
    type: 'video',
    src: '/assets/garagemailasque/video-04.mp4',
    poster: '/assets/garagemailasque/posters/video-04-poster.jpg',
    width: 576,
    height: 768,
    title: 'Profissional trabalhando',
    description: '',
  },
  {
    id: 'video-5',
    type: 'video',
    src: '/assets/garagemailasque/video-05.mp4',
    poster: '/assets/garagemailasque/posters/video-05-poster.jpg',
    width: 576,
    height: 768,
    title: 'Profissional trabalhando',
    description: '',
  },
  {
    id: 'video-6',
    type: 'video',
    src: '/assets/garagemailasque/video-06.mp4',
    poster: '/assets/garagemailasque/posters/video-06-poster.jpg',
    width: 576,
    height: 768,
    title: 'Profissional trabalhando',
    description: '',
  },
];

// Lista completa unificada para o carrossel (10 slides)
export const galleryAllSlides: GalleryItem[] = [
  ...galleryPhotosList,
  ...galleryVideosList,
];
