import React, { useState, useRef } from 'react';
import { Calculator, CreditCard, QrCode, Smartphone, Sparkles } from 'lucide-react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { businessData, buildWhatsAppUrl } from '../data/business';
import { trackEvent } from '../utils/analytics';

export const PaymentSimulator: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('1200');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Converte input limpo para número
  const numericValue = Math.max(0, parseFloat(inputValue.replace(/\D/g, '')) / 100 || 0);

  // Cálculos transparentes
  const installmentValue = numericValue > 0 ? numericValue / 3 : 0;
  const pixDiscount = numericValue > 0 ? numericValue * 0.05 : 0;
  const pixTotal = numericValue > 0 ? numericValue * 0.95 : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setInputValue('0');
      return;
    }
    const val = (parseInt(raw, 10) / 100).toFixed(2);
    setInputValue(val);

    // Debounce de 600ms para evitar disparo excessivo a cada dígito digitado
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      trackEvent('simulator_use', { reference_value: val });
    }, 600);
  };

  return (
    <section
      id="condicoes"
      aria-labelledby="payment-title"
      className="py-20 md:py-28 bg-[#0E0E0E] border-b border-[#2C2C2C] relative"
    >
      {/* Âncoras alternativas para navegação semântica */}
      <div id="condicoes-pagamento" className="sr-only" aria-hidden="true" />
      <div id="pagamento" className="sr-only" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Coluna Informativa das Condições */}
          <div className="lg:col-span-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-3 block">
              Condições Facilitadas
            </span>
            <h2
              id="payment-title"
              className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase text-[#F5F5F5] tracking-tight mb-6"
            >
              {businessData.payment.installments} ou{' '}
              <span className="text-[#22C55E]">{businessData.payment.cashDiscount}</span>
            </h2>
            <p className="text-base text-[#A3A3A3] leading-relaxed mb-8">
              Trabalhamos com flexibilidade e clareza para viabilizar o conserto do seu carro com a melhor tecnologia, sem aperto no orçamento.
            </p>

            {/* Badges de Meios de Pagamento */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#171717] border border-[#2C2C2C] card-hover-elevation">
                <CreditCard className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-bold text-[#F5F5F5]">Cartão de Crédito e Débito</h3>
                  <p className="text-xs text-[#A3A3A3] mt-0.5">
                    Parcelamento em até 3x sem juros em todas as principais bandeiras.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#171717] border border-[#2C2C2C] card-hover-elevation">
                <QrCode className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-bold text-[#F5F5F5]">PIX ou À Vista</h3>
                  <p className="text-xs text-[#A3A3A3] mt-0.5">
                    Economize 5% de desconto imediato em pagamentos via PIX ou em dinheiro.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#171717] border border-[#2C2C2C] card-hover-elevation">
                <Smartphone className="w-5 h-5 text-[#C9CDD2] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-bold text-[#F5F5F5]">Aproximação (NFC)</h3>
                  <p className="text-xs text-[#A3A3A3] mt-0.5">
                    Praticidade com Apple Pay, Google Pay e cartões contactless diretamente na oficina.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Simulador Interativo */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-[#171717] border border-[#2C2C2C] p-6 sm:p-8 shadow-2xl relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2C2C2C]">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
                  <span className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider">
                    Simulador de Referência
                  </span>
                </div>
                <span className="text-[11px] text-[#A3A3A3]">Client-side instantâneo</span>
              </div>

              {/* Campo de Entrada de Valor */}
              <div className="mb-6">
                <label htmlFor="simulador-valor" className="block text-xs font-semibold text-[#C9CDD2] mb-2">
                  Digite um valor estimado de referência (R$):
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#737373]">
                    R$
                  </span>
                  <input
                    id="simulador-valor"
                    type="text"
                    inputMode="numeric"
                    value={numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#121212] border border-[#2C2C2C] text-[#F5F5F5] font-display text-2xl font-bold tracking-tight focus:border-[#F97316] focus:outline-none transition-colors"
                    placeholder="1.200,00"
                  />
                </div>
              </div>

              {/* Resultados da Simulação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Opção 1: Parcelado em 3x */}
                <div className="p-4 rounded-2xl bg-[#1F1F1F] border border-[#2C2C2C] card-hover-elevation">
                  <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-1">
                    No Cartão (3x sem juros)
                  </span>
                  <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tabular-nums">
                    3x de {formatCurrency(installmentValue)}
                  </div>
                  <span className="text-xs text-[#737373] mt-1 block">
                    Total: {formatCurrency(numericValue)}
                  </span>
                </div>

                {/* Opção 2: PIX com 5% de desconto */}
                <div className="p-4 rounded-2xl bg-[#1F1F1F] border border-[#22C55E]/30 relative overflow-hidden card-hover-elevation">
                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider bg-[#22C55E]/10 px-2 py-0.5 rounded-md">
                      Economize 5%
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wider block mb-1">
                    No PIX ou À Vista
                  </span>
                  <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#22C55E] tabular-nums">
                    {formatCurrency(pixTotal)}
                  </div>
                  <span className="text-xs text-[#A3A3A3] mt-1 block">
                    Economia de {formatCurrency(pixDiscount)}
                  </span>
                </div>
              </div>

              {/* Botão de Envio de Simulação */}
              <a
                href={buildWhatsAppUrl({
                  originSection: 'site-simulador',
                  customText: `Olá, Garagem Mailasque! Fiz uma simulação de referência no valor de ${formatCurrency(numericValue)} e gostaria de agendar uma avaliação do meu veículo.`,
                })}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', { section: 'simulator' })}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] font-bold text-sm tracking-wide transition-colors duration-150 shadow-md focus-visible:outline-2 focus-visible:outline-[#F97316] mb-4"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Pedir avaliação desse valor no WhatsApp</span>
              </a>

              {/* Aviso Fixo Obrigatório */}
              <p className="text-[11px] text-[#737373] text-center leading-normal">
                {businessData.payment.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
