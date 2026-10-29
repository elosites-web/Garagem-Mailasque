/**
 * Fonte única da URL canônica do site em produção.
 * Lê de VITE_SITE_URL com fallback para https://www.garagemmailasque.com.br
 * Remove qualquer barra final para consistência absoluta.
 */
const rawSiteUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) || 'https://www.garagemmailasque.com.br';
export const SITE_URL: string = rawSiteUrl.includes('garagemmailasque.com.br') && !rawSiteUrl.includes('www.')
  ? rawSiteUrl.replace('garagemmailasque.com.br', 'www.garagemmailasque.com.br').replace(/\/+$/, '')
  : rawSiteUrl.replace(/\/+$/, '');

export interface DaySchedule {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  dayName: string;
  shortName: string;
  hours: string;
  isOpen: boolean;
  opens?: string;
  closes?: string;
}

export interface BusinessData {
  siteUrl: string;
  name: string;
  tagline: string;
  slogan: string;
  segment: string;
  cnpj: string;
  phone: string;
  phoneRaw: string;
  whatsappUrl: string;
  address: {
    street: string;
    neighborhood: string;
    district: string;
    city: string;
    state: string;
    cep: string;
    fullFormatted: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    referencePoints: string;
  };
  navigation: {
    geoScheme: string;
    googleMapsDirections: string;
    waze: string;
  };
  social: {
    instagram: string;
    instagramHandle: string;
    facebook: string;
    googleMaps: string;
    googleDirections: string;
    googleReview: string;
    googlePlaceId: string;
    googleWriteReview: string;
  };
  rating: {
    score: number;
    scoreFormatted: string;
    totalReviews: number;
    platform: string;
    dateReference: string;
  };
  schedule: DaySchedule[];
  scheduleSummary: string;
  holidayNote: string;
  payment: {
    highlight: string;
    methods: string[];
    installments: string;
    cashDiscount: string;
    disclaimer: string;
  };
  accessibility: string;
  insurers: {
    message: string;
    rightText: string;
  };
  partnershipApvs: {
    title: string;
    badge: string;
    description: string;
    disclaimer: string;
    imagePath: string;
  };
  credits: {
    developerName: string;
    controllerNotice: string;
  };
}

export const businessData: BusinessData = {
  siteUrl: SITE_URL,
  name: 'Garagem Mailasque',
  tagline: 'Especializada em funilaria e pintura automotiva, para devolver ao seu carro a aparência de zero km!',
  slogan: 'Acabamento impecável é nossa marca.',
  segment: 'Funilaria e Pintura Automotiva',
  cnpj: '07.540.332/0001-08',
  phone: '(11) 99562-5484',
  phoneRaw: '5511995625484',
  whatsappUrl: 'https://wa.me/5511995625484',
  address: {
    street: 'Rod. Raposo Tavares, Km 54,65',
    neighborhood: 'Pinheirinho',
    district: 'Mailasqui',
    city: 'São Roque',
    state: 'SP',
    cep: '18143-250',
    fullFormatted: 'Rod. Raposo Tavares, Km 54,65, bairro Pinheirinho, Mailasqui, São Roque/SP, CEP 18143-250',
    coordinates: {
      lat: -23.5702156,
      lng: -47.0743521,
    },
    referencePoints:
      'Localizada no km 54,65 da Rodovia Raposo Tavares, logo após o Trevo de Mailasqui (km 54,3) e a poucos metros do Posto 54 (Ipiranga), sentido interior / Sorocaba. Acesso direto pela marginal com retorno facilitado para ambos os sentidos da pista.',
  },
  navigation: {
    geoScheme: 'geo:0,0?q=-23.5702156,-47.0743521(Garagem+Mailasque)',
    googleMapsDirections: 'https://www.google.com/maps/dir/?api=1&destination=-23.5702156,-47.0743521',
    waze: 'https://waze.com/ul?ll=-23.5702156,-47.0743521&navigate=yes',
  },
  social: {
    instagram: 'https://www.instagram.com/garagem.mailasque',
    instagramHandle: '@garagem.mailasque',
    facebook: 'https://www.facebook.com/profile.php?id=61590154896365',
    googleMaps: 'https://www.google.com/maps/place/Garagem+Mailasque/@-23.5702156,-47.076927,17z/data=!3m1!4b1!4m6!3m5!1s0x94cf0d007ee6b1b5:0xf7bcdde9092c0dbb!8m2!3d-23.5702156!4d-47.0743521!16s%2Fg%2F11n9rzyf40',
    googleDirections: 'https://www.google.com/maps/dir/?api=1&destination=-23.5702156,-47.0743521',
    googleReview: 'https://www.google.com/maps/place/Garagem+Mailasque/@-23.5702156,-47.076927,17z/data=!3m1!4b1!4m6!3m5!1s0x94cf0d007ee6b1b5:0xf7bcdde9092c0dbb!8m2!3d-23.5702156!4d-47.0743521!16s%2Fg%2F11n9rzyf40',
    googlePlaceId: 'ChIJtbHmfgANz5QRuw0sCendvPc',
    googleWriteReview: 'https://search.google.com/local/writereview?placeid=ChIJtbHmfgANz5QRuw0sCendvPc',
  },
  rating: {
    score: 4.9,
    scoreFormatted: '4,9',
    totalReviews: 79,
    platform: 'Google',
    dateReference: 'out/2026',
  },
  // Horário oficial informado no fuso America/Sao_Paulo
  schedule: [
    { dayOfWeek: 1, dayName: 'Segunda-feira', shortName: 'Seg', hours: '08:00–18:00', isOpen: true, opens: '08:00', closes: '18:00' },
    { dayOfWeek: 2, dayName: 'Terça-feira', shortName: 'Ter', hours: '08:00–18:30', isOpen: true, opens: '08:00', closes: '18:30' },
    { dayOfWeek: 3, dayName: 'Quarta-feira', shortName: 'Qua', hours: '08:00–18:00', isOpen: true, opens: '08:00', closes: '18:00' },
    { dayOfWeek: 4, dayName: 'Quinta-feira', shortName: 'Qui', hours: '08:00–18:00', isOpen: true, opens: '08:00', closes: '18:00' },
    { dayOfWeek: 5, dayName: 'Sexta-feira', shortName: 'Sex', hours: '08:00–18:00', isOpen: true, opens: '08:00', closes: '18:00' },
    { dayOfWeek: 6, dayName: 'Sábado', shortName: 'Sáb', hours: '08:00–12:00', isOpen: true, opens: '08:00', closes: '12:00' },
    { dayOfWeek: 0, dayName: 'Domingo', shortName: 'Dom', hours: 'Fechado', isOpen: false },
  ],
  scheduleSummary: 'Seg a sex, 8h às 18h (terça até 18h30) · Sáb, 8h às 12h · Dom fechado',
  holidayNote: 'Feriados: confirme pelo WhatsApp',
  payment: {
    highlight: '3x sem juros ou 5% OFF no PIX ou à vista',
    methods: ['Cartão de Crédito', 'Cartão de Débito', 'Pagamento por aproximação (NFC)', 'PIX', 'Dinheiro'],
    installments: '3x sem juros',
    cashDiscount: '5% OFF no PIX ou à vista',
    disclaimer: 'Simulação ilustrativa. O valor do serviço é definido no orçamento.',
  },
  accessibility: 'Entrada com acesso para cadeirantes',
  insurers: {
    message: 'Seu carro, sua escolha de oficina',
    rightText: 'Atendemos todas as seguradoras. Por lei, você tem o direito de escolher a oficina de sua confiança para realizar o conserto do sinistro, mantendo a garantia e a qualidade do serviço.',
  },
  partnershipApvs: {
    title: 'Parceria APVS Brasil',
    badge: 'Novo ponto de venda cadastrado',
    description: 'Agora você encontra a APVS Brasil também na Garagem Mailasque. É a união entre quem cuida da estética do seu veículo e quem protege o seu patrimônio.',
    disclaimer: 'Serviço oferecido pela APVS Brasil.',
    imagePath: '/assets/garagemailasque/avps-protecao-veicular.jpg',
  },
  credits: {
    developerName: 'Desenvolvido por ēloSites',
    controllerNotice: 'Os dados enviados neste site são de responsabilidade da Garagem Mailasque (controladora).',
  },
};

/**
 * Retorna o dia da semana atual no fuso horário America/Sao_Paulo (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
 */
export function getCurrentDayOfWeekSaoPaulo(): number {
  try {
    const now = new Date();
    const spDateStr = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    const spDate = new Date(spDateStr);
    return spDate.getDay();
  } catch {
    return new Date().getDay();
  }
}

/**
 * Verifica se a oficina está em horário de atendimento no fuso de São Paulo (America/Sao_Paulo),
 * em conformidade com o openingHoursSpecification do Schema.org / JSON-LD:
 * - Seg, Qua, Qui, Sex: 08:00 às 18:00
 * - Terça: 08:00 às 18:30
 * - Sábado: 08:00 às 12:00
 * - Domingo: Fechado
 */
export function isWorkshopOpenNow(): boolean {
  try {
    const now = new Date();
    const spDateStr = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    const spDate = new Date(spDateStr);
    const day = spDate.getDay(); // 0 = Domingo, 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb
    const currentMinutes = spDate.getHours() * 60 + spDate.getMinutes();

    // Domingo fechado
    if (day === 0) return false;

    // Sábado: 08:00 às 12:00
    if (day === 6) {
      return currentMinutes >= 8 * 60 && currentMinutes < 12 * 60;
    }

    // Terça-feira: 08:00 às 18:30
    if (day === 2) {
      return currentMinutes >= 8 * 60 && currentMinutes < 18 * 60 + 30;
    }

    // Segunda, Quarta, Quinta, Sexta: 08:00 às 18:00
    if ([1, 3, 4, 5].includes(day)) {
      return currentMinutes >= 8 * 60 && currentMinutes < 18 * 60;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Função utilitária para gerar links do WhatsApp padronizados
 * com parâmetros de origem para rastreamento interno do cliente
 */
export function buildWhatsAppUrl(options: {
  originSection: string;
  service?: string;
  vehicle?: string;
  isInsurance?: boolean | string;
  customText?: string;
}): string {
  if (options.customText) {
    const text = `${options.customText} [${options.originSection}]`;
    return `https://wa.me/${businessData.phoneRaw}?text=${encodeURIComponent(text)}`;
  }

  const parts = ['Olá, Garagem Mailasque! Vim pelo site e quero um orçamento.'];
  
  if (options.service) {
    parts.push(`Serviço desejado: ${options.service}.`);
  }
  if (options.vehicle) {
    parts.push(`Meu carro: ${options.vehicle}.`);
  }
  if (options.isInsurance !== undefined && options.isInsurance !== '') {
    const seguroStr = typeof options.isInsurance === 'boolean' 
      ? (options.isInsurance ? 'Sim' : 'Não') 
      : String(options.isInsurance);
    parts.push(`Seguro: ${seguroStr}.`);
  }

  parts.push(`[${options.originSection}]`);

  const fullText = parts.join(' ');
  return `https://wa.me/${businessData.phoneRaw}?text=${encodeURIComponent(fullText)}`;
}
