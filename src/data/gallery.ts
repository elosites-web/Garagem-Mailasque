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

export interface GalleryVideo {
  id: string;
  type: 'video';
  src: string;
  poster: string;
  title: string;
  description: string;
}

export const galleryPhotos: GalleryPhoto[] = [
  {
    id: 'camara-pintura',
    type: 'image',
    src: '/assets/garagemailasque/camara-de-pintura.jpeg',
    alt: 'Câmara de pintura automotiva pressurizada da Garagem Mailasque',
    caption: 'Câmara de pintura pressurizada própria para acabamento sem impurezas',
    category: 'instalacoes',
    width: 1280,
    height: 960,
  },
  {
    id: 'recepcao',
    type: 'image',
    src: '/assets/garagemailasque/recepcao.jpeg',
    alt: 'Área de recepção e atendimento ao cliente na Garagem Mailasque',
    caption: 'Espaço de recepção organizado e acolhedor para atendimento',
    category: 'instalacoes',
    width: 1280,
    height: 960,
  },
  {
    id: 'estacionamento',
    type: 'image',
    src: '/assets/garagemailasque/estacionamento.jpeg',
    alt: 'Pátio e área de estacionamento da Garagem Mailasque em Mailasqui',
    caption: 'Pátio amplo com fácil manobra e acesso para cadeirantes',
    category: 'instalacoes',
    width: 1280,
    height: 960,
  },
  {
    id: 'equipe-1',
    type: 'image',
    src: '/assets/garagemailasque/equipe1.jpeg',
    alt: 'Equipe da Garagem Mailasque na oficina',
    caption: 'Profissionais dedicados ao cuidado e acabamento do seu veículo',
    category: 'equipe',
    width: 1280,
    height: 960,
  },
  {
    id: 'equipe-2',
    type: 'image',
    src: '/assets/garagemailasque/equipe2.jpeg',
    alt: 'Equipe da Garagem Mailasque na oficina',
    caption: 'Compromisso com transparência e atenção aos mínimos detalhes',
    category: 'equipe',
    width: 1280,
    height: 960,
  },
  {
    id: 'card-apresentacao',
    type: 'image',
    src: '/assets/garagemailasque/card-apresentacao.jpg',
    alt: 'Apresentação institucional e serviços da Garagem Mailasque',
    caption: 'Identidade e padrão de atendimento da oficina',
    category: 'instalacoes',
    width: 1200,
    height: 630,
  },
];

export const galleryVideos: GalleryVideo[] = [
  {
    id: 'video-hero',
    type: 'video',
    src: '/assets/garagemailasque/garagem-video1.mp4',
    poster: '/assets/garagemailasque/camara-de-pintura.jpeg',
    title: 'Visão Geral dos Serviços',
    description: 'Rotina de acabamento e preparação técnica na oficina.',
  },
  {
    id: 'video-2',
    type: 'video',
    src: '/assets/garagemailasque/video-02.mp4',
    poster: '/assets/garagemailasque/camara-de-pintura.jpeg',
    title: 'Processo de Pintura em Estufa',
    description: 'Controle de acabamento e aplicação de verniz de alto brilho.',
  },
  {
    id: 'video-3',
    type: 'video',
    src: '/assets/garagemailasque/video-03.mp4',
    poster: '/assets/garagemailasque/equipe1.jpeg',
    title: 'Acerto e Reparação de Lataria',
    description: 'Trabalho minucioso de funilaria devolvendo as linhas de fábrica.',
  },
  {
    id: 'video-4',
    type: 'video',
    src: '/assets/garagemailasque/video-04.mp4',
    poster: '/assets/garagemailasque/estacionamento.jpeg',
    title: 'Inspeção e Qualidade Final',
    description: 'Conferência detalhada antes da entrega do carro ao cliente.',
  },
  {
    id: 'video-5',
    type: 'video',
    src: '/assets/garagemailasque/video-05.mp4',
    poster: '/assets/garagemailasque/camara-de-pintura.jpeg',
    title: 'Tratamento de Superfícies',
    description: 'Aplicação técnica para proteção e acabamento impecável.',
  },
  {
    id: 'video-6',
    type: 'video',
    src: '/assets/garagemailasque/video-06.mp4',
    poster: '/assets/garagemailasque/recepcao.jpeg',
    title: 'Entregas e Satisfação',
    description: 'Veículo pronto com aparência de zero km.',
  },
];
