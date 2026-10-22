import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { services } from '../data/services';
import { buildWhatsAppUrl } from '../data/business';
import { trackEvent } from '../utils/analytics';

interface FormState {
  name: string;
  phone: string;
  service: string;
  vehicle: string;
  isInsurance: string;
  consent: boolean;
}

interface FormErrors {
  name?: string;
  phone?: string;
  service?: string;
  vehicle?: string;
  isInsurance?: string;
  consent?: string;
}

interface QuoteFormProps {
  onOpenPrivacyModal?: () => void;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({ onOpenPrivacyModal }) => {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    phone: '',
    service: 'Funilaria',
    vehicle: '',
    isInsurance: 'Não',
    consent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Formatação de telefone com máscara brasileira (XX) XXXXX-XXXX
  const formatPhone = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Por favor, informe seu nome completo.';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = 'Informe um WhatsApp válido com DDD (ex.: 11 99999-9999).';
    }

    if (!formData.service) {
      newErrors.service = 'Selecione o serviço desejado.';
    }

    if (!formData.vehicle.trim() || formData.vehicle.trim().length < 2) {
      newErrors.vehicle = 'Informe o modelo e ano do seu carro.';
    }

    if (!formData.isInsurance) {
      newErrors.isInsurance = 'Selecione se o atendimento é pelo seguro.';
    }

    if (!formData.consent) {
      newErrors.consent = 'Você precisa concordar com os termos de privacidade para continuar.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    trackEvent('form_submit', {
      service: formData.service,
      is_insurance: formData.isInsurance,
    });

    const targetUrl = buildWhatsAppUrl({
      originSection: 'site-form',
      service: formData.service,
      vehicle: formData.vehicle.trim(),
      isInsurance: formData.isInsurance,
      customText: `Olá, Garagem Mailasque! Vim pelo site. Meu nome é ${formData.name.trim()}. Quero um orçamento de ${formData.service}. Meu carro: ${formData.vehicle.trim()}. Seguro: ${formData.isInsurance}.`,
    });

    setIsSuccess(true);

    // Redireciona para o WhatsApp após breve transição de estado visual
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 700);
  };

  return (
    <section
      id="orcamento"
      aria-labelledby="quote-form-title"
      className="py-20 md:py-28 bg-[#171717] border-b border-[#2C2C2C] relative"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-3 block">
            Orçamento Rápido
          </span>
          <h2
            id="quote-form-title"
            className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase text-[#F5F5F5] tracking-tight mb-4"
          >
            Peça sua cotação diretamente com nossa equipe
          </h2>
          <p className="text-base text-[#A3A3A3] max-w-xl mx-auto">
            Preencha os dados do seu veículo abaixo. Ao clicar em enviar, uma mensagem estruturada será aberta no seu WhatsApp pronta para envio.
          </p>
        </div>

        <div className="rounded-3xl bg-[#1F1F1F] border border-[#2C2C2C] p-6 sm:p-10 shadow-2xl">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#22C55E]/15 border border-[#22C55E] flex items-center justify-center text-[#22C55E] mb-4">
                <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold text-[#F5F5F5] mb-2">Abrindo o WhatsApp...</h3>
              <p className="text-sm text-[#A3A3A3] max-w-md">
                Você está sendo direcionado para o chat oficial da Garagem Mailasque com os dados já preenchidos.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nome */}
                <div>
                  <label htmlFor="form-name" className="block text-xs font-bold text-[#C9CDD2] uppercase tracking-wider mb-2">
                    Seu Nome *
                  </label>
                  <input
                    id="form-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    placeholder="Ex.: Carlos Mendes"
                    aria-describedby={errors.name ? 'error-name' : undefined}
                    aria-invalid={Boolean(errors.name)}
                    className={`w-full px-4 py-3.5 rounded-xl bg-[#121212] border text-[#F5F5F5] text-sm focus:outline-none transition-colors ${
                      errors.name ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#2C2C2C] focus:border-[#F97316]'
                    }`}
                  />
                  {errors.name && (
                    <p id="error-name" role="alert" className="mt-1.5 text-xs text-[#EF4444] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* WhatsApp com DDD */}
                <div>
                  <label htmlFor="form-phone" className="block text-xs font-bold text-[#C9CDD2] uppercase tracking-wider mb-2">
                    WhatsApp com DDD *
                  </label>
                  <input
                    id="form-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    aria-describedby={errors.phone ? 'error-phone' : undefined}
                    aria-invalid={Boolean(errors.phone)}
                    className={`w-full px-4 py-3.5 rounded-xl bg-[#121212] border text-[#F5F5F5] text-sm focus:outline-none transition-colors ${
                      errors.phone ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#2C2C2C] focus:border-[#F97316]'
                    }`}
                  />
                  {errors.phone && (
                    <p id="error-phone" role="alert" className="mt-1.5 text-xs text-[#EF4444] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Serviço Desejado */}
                <div>
                  <label htmlFor="form-service" className="block text-xs font-bold text-[#C9CDD2] uppercase tracking-wider mb-2">
                    Serviço Desejado *
                  </label>
                  <select
                    id="form-service"
                    value={formData.service}
                    onChange={(e) => {
                      setFormData({ ...formData, service: e.target.value });
                      if (errors.service) setErrors({ ...errors, service: undefined });
                    }}
                    aria-describedby={errors.service ? 'error-service' : undefined}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#121212] border border-[#2C2C2C] text-[#F5F5F5] text-sm focus:border-[#F97316] focus:outline-none transition-colors"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.name} className="bg-[#121212] text-[#F5F5F5]">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Veículo (Modelo / Ano) */}
                <div>
                  <label htmlFor="form-vehicle" className="block text-xs font-bold text-[#C9CDD2] uppercase tracking-wider mb-2">
                    Modelo e Ano do Veículo *
                  </label>
                  <input
                    id="form-vehicle"
                    type="text"
                    required
                    value={formData.vehicle}
                    onChange={(e) => {
                      setFormData({ ...formData, vehicle: e.target.value });
                      if (errors.vehicle) setErrors({ ...errors, vehicle: undefined });
                    }}
                    placeholder="Ex.: Fiat Toro 2021"
                    aria-describedby={errors.vehicle ? 'error-vehicle' : undefined}
                    aria-invalid={Boolean(errors.vehicle)}
                    className={`w-full px-4 py-3.5 rounded-xl bg-[#121212] border text-[#F5F5F5] text-sm focus:outline-none transition-colors ${
                      errors.vehicle ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#2C2C2C] focus:border-[#F97316]'
                    }`}
                  />
                  {errors.vehicle && (
                    <p id="error-vehicle" role="alert" className="mt-1.5 text-xs text-[#EF4444] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{errors.vehicle}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* É pelo seguro? */}
              <div>
                <span className="block text-xs font-bold text-[#C9CDD2] uppercase tracking-wider mb-2">
                  O reparo é por seguradora? *
                </span>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-[#F5F5F5]">
                    <input
                      type="radio"
                      name="isInsurance"
                      value="Não"
                      checked={formData.isInsurance === 'Não'}
                      onChange={() => setFormData({ ...formData, isInsurance: 'Não' })}
                      className="w-4 h-4 text-[#F97316] bg-[#121212] border-[#2C2C2C] focus:ring-[#F97316]"
                    />
                    <span>Não, particular</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-[#F5F5F5]">
                    <input
                      type="radio"
                      name="isInsurance"
                      value="Sim"
                      checked={formData.isInsurance === 'Sim'}
                      onChange={() => setFormData({ ...formData, isInsurance: 'Sim' })}
                      className="w-4 h-4 text-[#F97316] bg-[#121212] border-[#2C2C2C] focus:ring-[#F97316]"
                    />
                    <span>Sim, por seguro (qualquer seguradora)</span>
                  </label>
                </div>
              </div>

              {/* Consentimento LGPD com link para política */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-[#A3A3A3] leading-relaxed">
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => {
                      setFormData({ ...formData, consent: e.target.checked });
                      if (errors.consent) setErrors({ ...errors, consent: undefined });
                    }}
                    aria-describedby={errors.consent ? 'error-consent' : undefined}
                    className="w-4 h-4 mt-0.5 rounded text-[#F97316] bg-[#121212] border-[#2C2C2C] focus:ring-[#F97316]"
                  />
                  <span>
                    Concordo em fornecer meus dados (nome, WhatsApp e dados do veículo) exclusivamente para que a Garagem Mailasque entre em contato para fornecer o orçamento solicitado, nos termos da{' '}
                    <button
                      type="button"
                      onClick={onOpenPrivacyModal}
                      className="text-[#F97316] underline hover:text-[#EA580C] focus-visible:outline-2 focus-visible:outline-[#F97316]"
                    >
                      Política de Privacidade
                    </button>
                    .
                  </span>
                </label>
                {errors.consent && (
                  <p id="error-consent" role="alert" className="mt-1.5 text-xs text-[#EF4444] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{errors.consent}</span>
                  </p>
                )}
              </div>

              {/* Botão de Envio */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] font-bold text-base tracking-wide transition-all duration-150 shadow-xl hover:shadow-[#F97316]/20 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#F97316]"
                >
                  <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Enviar dados e abrir no WhatsApp</span>
                </button>
                <p className="text-[11px] text-[#737373] text-center mt-2">
                  Atendimento sem burocracia. Você poderá enviar fotos adicionais diretamente na conversa.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
