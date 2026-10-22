export interface BeforeAfterCase {
  id: string;
  title: string;
  vehicle: string;
  serviceCategory: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  beforeAlt: string;
  afterAlt: string;
  highlight?: string;
}

/**
 * Casos autênticos de Antes e Depois da Garagem Mailasque.
 *
 * Registros fotográficos reais de veículos em processo de funilaria, restauração
 * e pintura técnica na estufa da Garagem Mailasque.
 */
export const beforeAfterCases: BeforeAfterCase[] = [
  {
    id: 'honda-city-pintura-lateral',
    title: 'Pintura e acabamento lateral em estufa aquecida',
    vehicle: 'Honda City',
    serviceCategory: 'Pintura em Estufa e Acabamento',
    description: 'Processo técnico de isolamento e preparação de lateral traseira com primer PU, seguido de aplicação de tinta e verniz de alto sólido curado na estufa aquecida da Garagem Mailasque.',
    beforeImage: '/assets/garagemailasque/hondacity-antes.jpg.jpeg',
    afterImage: '/assets/garagemailasque/hondacity-depois.jpg.jpeg',
    beforeAlt: 'Honda City em preparação com primer e isolamento protetor na estufa de pintura da Garagem Mailasque',
    afterAlt: 'Honda City com pintura lateral e acabamento brilhante finalizado na estufa da Garagem Mailasque',
    highlight: 'Estufa Aquecida',
  },
];
