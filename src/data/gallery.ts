export interface GalleryPhoto {
  id: string;
  type: 'image';
  src: string;
  alt: string;
  caption: string;
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
}

export type GalleryItem = GalleryPhoto | GalleryTeamSlide | GalleryVideo;

export const galleryPhotosList: (GalleryPhoto | GalleryTeamSlide)[] = [
  {
    id: 'camara-pintura',
    type: 'image',
    src: '/assets/garagemailasque/camara-de-pintura.jpeg',
    width: 1027,
    height: 1011,
    alt: 'Câmara de pintura da Garagem Mailasque, com paredes brancas e laranja, luzes de LED e piso escuro com borda vermelha',
    caption: 'Câmara de pintura',
    category: 'instalacoes',
  },
  {
    id: 'equipe-unificada',
    type: 'team',
    caption: 'Equipe Garagem Mailasque',
    category: 'equipe',
    photos: [
      {
        src: '/assets/garagemailasque/equipe1.jpeg',
        width: 1254,
        height: 787,
        alt: 'Equipe da Garagem Mailasque reunida na oficina',
      },
      {
        src: '/assets/garagemailasque/equipe2.jpeg',
        width: 828,
        height: 500,
        alt: 'Equipe da Garagem Mailasque posando na oficina',
      },
    ],
  },
  {
    id: 'recepcao',
    type: 'image',
    src: '/assets/garagemailasque/recepcao.jpeg',
    width: 1086,
    height: 1417,
    alt: 'Sala de recepção da Garagem Mailasque, com cadeiras, balcão e parede laranja',
    caption: 'Recepção',
    category: 'instalacoes',
  },
  {
    id: 'fachada',
    type: 'image',
    src: '/assets/garagemailasque/estacionamento.jpeg',
    width: 925,
    height: 583,
    alt: 'Fachada da Garagem Mailasque com o letreiro Funilaria e Pintura e seta indicando a recepção',
    caption: 'Fachada e entrada',
    category: 'instalacoes',
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
    title: 'Trabalho na dianteira',
    description: 'Profissional com ferramenta elétrica na região do farol de um carro branco.',
  },
  {
    id: 'video-2',
    type: 'video',
    src: '/assets/garagemailasque/video-02.mp4',
    poster: '/assets/garagemailasque/posters/video-02-poster.jpg',
    width: 576,
    height: 768,
    title: 'Preparação da lataria',
    description: 'Lixamento na dianteira de um carro com o para-choque removido.',
  },
  {
    id: 'video-3',
    type: 'video',
    src: '/assets/garagemailasque/video-03.mp4',
    poster: '/assets/garagemailasque/posters/video-03-poster.jpg',
    width: 576,
    height: 768,
    title: 'Reparo na dianteira',
    description: 'Visão geral do trabalho de funilaria em um carro branco com o capô aberto.',
  },
  {
    id: 'video-4',
    type: 'video',
    src: '/assets/garagemailasque/video-04.mp4',
    poster: '/assets/garagemailasque/posters/video-04-poster.jpg',
    width: 576,
    height: 768,
    title: 'Solda na chapa',
    description: 'Profissional trabalhando na chapa do capô de um carro vermelho.',
  },
  {
    id: 'video-5',
    type: 'video',
    src: '/assets/garagemailasque/video-05.mp4',
    poster: '/assets/garagemailasque/posters/video-05-poster.jpg',
    width: 576,
    height: 768,
    title: 'Funilaria em carro vermelho',
    description: 'Reparo na chapa do capô, com faíscas durante o trabalho.',
  },
  {
    id: 'video-6',
    type: 'video',
    src: '/assets/garagemailasque/video-06.mp4',
    poster: '/assets/garagemailasque/posters/video-06-poster.jpg',
    width: 576,
    height: 768,
    title: 'Acabamento da lataria',
    description: 'Profissional trabalhando na lataria de um carro vermelho.',
  },
];

// Lista completa unificada para o carrossel (10 slides)
export const galleryAllSlides: GalleryItem[] = [
  ...galleryPhotosList,
  ...galleryVideosList,
];
