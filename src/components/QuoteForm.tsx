import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Wrench, Calendar, FileText } from 'lucide-react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { services } from '../data/services';
import { buildWhatsAppUrl, WHATSAPP_EMOJIS } from '../data/business';
import { trackLeadSubmission } from '../utils/analytics';

const DAMAGED_PARTS_OPTIONS = [
  'Para-choque dianteiro',
  'Para-choque traseiro',
  'Capô',
  'Paralama',
  'Porta',
  'Lateral / Teto',
  'Tampa traseira / Porta-malas',
  'Outra peça',
];

interface FormState {
  name: string;
  phone: string;
  service: string;
  vehicle: string;
  vehicleYear: string;
  damagedParts: string[];
  otherPartText: string;
  damageDescription: string;
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
    vehicleYear: '',
    damagedParts: [],
    otherPartText: '',
    damageDescription: '',
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

  const handlePartToggle = (part: string) => {
    setFormData((prev) => {
      const exists = prev.damagedParts.includes(part);
      const nextParts = exists
        ? prev.damagedParts.filter((p) => p !== part)
        : [...prev.damagedParts, part];
      return {
        ...prev,
        damagedParts: nextParts,
        otherPartText: !nextParts.includes('Outra peça') ? '' : prev.otherPartText,
      };
    });
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
      newErrors.vehicle = 'Informe o modelo do seu carro.';
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
    trackLeadSubmission({
      service: formData.service,
      isInsurance: formData.isInsurance,
      hasYear: Boolean(formData.vehicleYear.trim()),
      partsCount: formData.damagedParts.length,
      hasNotes: Boolean(formData.damageDescription.trim()),
    });

    // Monta o resumo das peças danificadas
    const selectedPartsList = formData.damagedParts.map((p) => {
      if (p === 'Outra peça' && formData.otherPartText.trim()) {
        return `Outra (${formData.otherPartText.trim()})`;
      }
      return p;
    });

    const partsString = selectedPartsList.length > 0 ? selectedPartsList.join(', ') : '';

    // Monta a mensagem estruturada e amigável para o WhatsApp
    const lines: string[] = [
      `Olá, *Garagem Mailasque*! ${WHATSAPP_EMOJIS.wave}`,
      '',
      'Vim pelo site e gostaria de solicitar um orçamento.',
      '',
      `${WHATSAPP_EMOJIS.user} *Nome:* ${formData.name.trim()}`,
      `${WHATSAPP_EMOJIS.tools} *Serviço:* ${formData.service}`,
      `${WHATSAPP_EMOJIS.car} *Veículo:* ${formData.vehicle.trim()}${formData.vehicleYear.trim() ? ` (${formData.vehicleYear.trim()})` : ''}`,
      `${WHATSAPP_EMOJIS.shield} *Seguro:* ${formData.isInsurance === 'Sim' ? 'Sim, por seguro' : 'Não, particular'}`,
    ];

    if (partsString) {
      lines.push(`${WHATSAPP_EMOJIS.wrench} *Peças a reparar:* ${partsString}`);
    }

    if (formData.damageDescription.trim()) {
      lines.push(`${WHATSAPP_EMOJIS.memo} *Detalhes:* ${formData.damageDescription.trim()}`);
    }

    lines.push('', `Podem me orientar, por favor? ${WHATSAPP_EMOJIS.smile}`);

    const customText = lines.join('\n');

    const targetUrl = buildWhatsAppUrl({
      originSection: 'site-form',
      customText,
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
      {/* Âncora alternativa para #cotacao */}
      <div id="cotacao" className="sr-only" aria-hidden="true" />
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
              {/* Linha 1: Nome e WhatsApp */}
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

              {/* Linha 2: Serviço e Veículo */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                {/* Serviço Desejado */}
                <div className="sm:col-span-5">
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

                {/* Veículo (Modelo) */}
                <div className="sm:col-span-4">
                  <label htmlFor="form-vehicle" className="block text-xs font-bold text-[#C9CDD2] uppercase tracking-wider mb-2">
                    Modelo do Veículo *
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
                    placeholder="Ex.: Fiat Toro, HB20, Corolla"
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

                {/* Ano do Veículo (Opcional) */}
                <div className="sm:col-span-3">
                  <label htmlFor="form-vehicle-year" className="block text-xs font-bold text-[#C9CDD2] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Ano</span>
                    <span className="text-[10px] text-[#737373] font-normal lowercase">(opcional)</span>
                  </label>
                  <input
                    id="form-vehicle-year"
                    type="text"
                    maxLength={9}
                    value={formData.vehicleYear}
                    onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                    placeholder="Ex.: 2021"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#121212] border border-[#2C2C2C] text-[#F5F5F5] text-sm focus:border-[#F97316] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Linha 3: Peças / Áreas Danificadas (Multi-seleção opcional) */}
              <div>
                <label className="block text-xs font-bold text-[#C9CDD2] uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
                    <span>Peças ou Regiões a Reparar</span>
                  </span>
                  <span className="text-[10px] text-[#737373] font-normal lowercase">(seleção opcional)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {DAMAGED_PARTS_OPTIONS.map((part) => {
                    const isSelected = formData.damagedParts.includes(part);
                    return (
                      <button
                        key={part}
                        type="button"
                        onClick={() => handlePartToggle(part)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between focus-visible:outline-2 focus-visible:outline-[#F97316] ${
                          isSelected
                            ? 'bg-[#F97316]/15 border-[#F97316] text-[#F97316]'
                            : 'bg-[#121212] border-[#2C2C2C] text-[#A3A3A3] hover:border-[#3E3E3E] hover:text-[#F5F5F5]'
                        }`}
                      >
                        <span className="truncate">{part}</span>
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ml-1.5 ${
                            isSelected ? 'bg-[#F97316] border-[#F97316]' : 'border-[#444444]'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Campo condicional para detalhar 'Outra peça' */}
                {formData.damagedParts.includes('Outra peça') && (
                  <div className="mt-3">
                    <label htmlFor="form-other-part" className="sr-only">
                      Especifique a outra peça
                    </label>
                    <input
                      id="form-other-part"
                      type="text"
                      value={formData.otherPartText}
                      onChange={(e) => setFormData({ ...formData, otherPartText: e.target.value })}
                      placeholder="Especifique qual peça ou área (ex.: retrovisor, caixa de ar, teto)..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#121212] border border-[#2C2C2C] text-[#F5F5F5] text-xs focus:border-[#F97316] focus:outline-none transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Linha 4: Descrição / Observações adicionais do dano (Opcional) */}
              <div>
                <label htmlFor="form-damage-description" className="block text-xs font-bold text-[#C9CDD2] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
                    <span>Detalhes do Dano ou Observações</span>
                  </span>
                  <span className="text-[10px] text-[#737373] font-normal lowercase">(opcional)</span>
                </label>
                <textarea
                  id="form-damage-description"
                  rows={2}
                  value={formData.damageDescription}
                  onChange={(e) => setFormData({ ...formData, damageDescription: e.target.value })}
                  placeholder="Ex.: Batida na quina direita, amassado leve sem riscar a tinta, ralado no para-choque..."
                  className="w-full px-4 py-3 rounded-xl bg-[#121212] border border-[#2C2C2C] text-[#F5F5F5] text-sm focus:border-[#F97316] focus:outline-none transition-colors resize-none placeholder-neutral-500"
                />
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
                  <WhatsAppIcon className="w-5 h-5 shrink-0" aria-hidden="true" />
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
