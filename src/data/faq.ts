export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    id: 'horario',
    question: 'Qual o horário de atendimento?',
    answer:
      'Nosso horário de funcionamento é: Segunda-feira: 08:00–18:00 | Terça-feira: 08:00–18:30 | Quarta-feira: 08:00–18:00 | Quinta-feira: 08:00–18:00 | Sexta-feira: 08:00–18:00 | Sábado: 08:00–12:00 | Domingo: Fechado. Feriados: confirme pelo WhatsApp.',
  },
  {
    id: 'seguradoras',
    question: 'A Garagem Mailasque atende seguradoras?',
    answer:
      'Sim, atendemos todas as seguradoras. É um direito legal do consumidor escolher livremente a oficina em que deseja consertar o seu veículo após um sinistro, independentemente da seguradora contratada.',
  },
  {
    id: 'pagamento',
    question: 'Quais são as condições e formas de pagamento aceitas?',
    answer:
      'Facilitamos seu pagamento em até 3x sem juros no cartão de crédito ou com 5% de desconto à vista / no PIX. Aceitamos também cartão de débito e pagamento por aproximação (NFC).',
  },
  {
    id: 'orcamento',
    question: 'Como faço para solicitar um orçamento?',
    answer:
      'É simples e rápido: basta clicar nos botões do site para abrir o WhatsApp da oficina, enviar fotos dos danos do veículo e informar o modelo e ano do carro. Nossa equipe responderá diretamente pela conversa.',
  },
  {
    id: 'localizacao',
    question: 'Onde a oficina está localizada?',
    answer:
      'Estamos localizados na Rodovia Raposo Tavares, Km 54,65, no bairro Pinheirinho, em Mailasqui (São Roque/SP), CEP 18143-250. O espaço conta com entrada acessível para cadeirantes e pátio amplo.',
  },
  {
    id: 'servicos',
    question: 'Quais serviços automotivos são realizados na oficina?',
    answer:
      'Trabalhamos focados em quatro especialidades: Funilaria (reparação e alinhamento de lataria), Pintura (em câmara pressurizada própria), Martelinho (desamassamento sem repintura) e Revisão preventiva.',
  },
];
