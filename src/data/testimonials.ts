export interface Testimonial {
  id: string;
  author: string;
  rating: number;
  source: string;
  quote: string;
  authorized: boolean;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    author: 'Marcelo Ferr',
    rating: 5,
    source: 'Avaliação no Google',
    quote: 'Excelente atendimento, serviço perfeito, entrega no prazo combinado. Parabéns',
    authorized: true,
  },
  {
    id: '2',
    author: 'Michael Costa',
    rating: 5,
    source: 'Avaliação no Google',
    quote: 'Sensacional trabalho, deixou meu carro impecável! Atencioso, bom preço e justo!',
    authorized: true,
  },
  {
    id: '3',
    author: 'Ana Paula Silva',
    rating: 5,
    source: 'Avaliação no Google',
    quote: 'Excelente atendimento. Serviço executado com capricho, dedicação e qualidade! Obrigado!',
    authorized: true,
  },
  {
    id: '4',
    author: 'Leandro Da Silva Lopes',
    rating: 5,
    source: 'Avaliação no Google',
    quote: 'Serviço excelente, atendimento nota 10. Muito atencioso e organizado. Super recomendo.',
    authorized: true,
  },
  {
    id: '5',
    author: 'Daniela Silva',
    rating: 5,
    source: 'Avaliação no Google',
    quote: 'Ótimo atendimento, preços justos, rápidos em executar os serviços, excelente trabalho! Super recomendo',
    authorized: true,
  },
  {
    id: '6',
    author: 'Suelen Prietto',
    rating: 5,
    source: 'Avaliação no Google',
    quote: 'São profissionais competentes, que fazem muito bem o trabalho...',
    authorized: true,
  },
];
