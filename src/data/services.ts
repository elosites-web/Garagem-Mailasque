import { WHATSAPP_EMOJIS } from './business';

export interface ServiceItem {
  id: string;
  name: string;
  iconName: 'Hammer' | 'PaintBucket' | 'Wrench' | 'ShieldCheck';
  shortDescription: string;
  fullDescription: string;
  highlights: string[];
  whatsappMessage: string;
}

export const services: ServiceItem[] = [
  {
    id: 'funilaria',
    name: 'Funilaria',
    iconName: 'Hammer',
    shortDescription: 'Alinhamento estrutural, recuperação de lataria e peças após colisões com ferramentas especializadas.',
    fullDescription: 'Reparação de amassados leves, médios e estruturais com foco na restauração precisa das linhas e medidas originais do veículo.',
    highlights: ['Recuperação de peças originais', 'Alinhamento com gabarito técnico', 'Atende todas as seguradoras'],
    whatsappMessage: `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}\n\nGostaria de solicitar um orçamento para *Funilaria*.\n\nPodem me orientar, por favor? ${WHATSAPP_EMOJIS.smile}`,
  },
  {
    id: 'pintura',
    name: 'Pintura',
    iconName: 'PaintBucket',
    shortDescription: 'Câmara de pintura profissional com acerto digital de cor e acabamento de alto padrão automotivo.',
    fullDescription: 'Aplicação técnica com controle de temperatura e pureza do ar na câmara de pintura própria, garantindo fidelidade de tonalidade e brilho uniforme.',
    highlights: ['Câmara pressurizada própria', 'Colorimetria precisa de fábrica', 'Acabamento uniforme sem impurezas'],
    whatsappMessage: `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}\n\nGostaria de solicitar um orçamento para *Pintura*.\n\nPodem me orientar, por favor? ${WHATSAPP_EMOJIS.smile}`,
  },
  {
    id: 'martelinho',
    name: 'Martelinho',
    iconName: 'Wrench',
    shortDescription: 'Técnica artesanal para desamassar pequenos impactos sem danificar a pintura original de fábrica.',
    fullDescription: 'Ideal para mossas de chuva de granizo, batidas de porta em estacionamento e pequenas ondulações, preservando a originalidade do carro.',
    highlights: ['Preserva a pintura original', 'Sem uso de massa plástica', 'Menor intervenção no veículo'],
    whatsappMessage: `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}\n\nGostaria de solicitar um orçamento para *Martelinho*.\n\nPodem me orientar, por favor? ${WHATSAPP_EMOJIS.smile}`,
  },
  {
    id: 'revisao-preventiva',
    name: 'Revisão preventiva',
    iconName: 'ShieldCheck',
    shortDescription: 'Inspeção de pontos vitais do veículo com transparência e diagnóstico focado na segurança.',
    fullDescription: 'Avaliação criteriosa dos itens essenciais de desgaste, funcionamento mecânico e integridade visual para rodar com total tranquilidade.',
    highlights: ['Inspeção visual e de componentes', 'Diagnóstico transparente', 'Cuidado e segurança para a família'],
    whatsappMessage: `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}\n\nGostaria de solicitar um orçamento para *Revisão preventiva*.\n\nPodem me orientar, por favor? ${WHATSAPP_EMOJIS.smile}`,
  },
];
