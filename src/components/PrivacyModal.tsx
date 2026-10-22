import React, { useEffect, useRef } from 'react';
import { X, Shield, Lock, FileText } from 'lucide-react';
import { businessData } from '../data/business';

export type LegalDocType = 'privacy' | 'terms';

interface PrivacyModalProps {
  type: LegalDocType;
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ type, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtnRef.current?.focus(), 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#171717] border border-[#2C2C2C] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Topo do Modal */}
        <div className="p-6 border-b border-[#2C2C2C] flex items-center justify-between bg-[#1A1A1A]">
          <div className="flex items-center gap-2.5">
            {isPrivacy ? (
              <Shield className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
            ) : (
              <FileText className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
            )}
            <h2 id="legal-modal-title" className="text-lg font-bold text-[#F5F5F5]">
              {isPrivacy ? 'Política de Privacidade' : 'Termos de Uso'}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#262626] transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Alerta de modelo padrão */}
        <div className="px-6 py-3 bg-[#262626]/60 border-b border-[#2C2C2C] text-xs text-[#F59E0B] flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Modelo de transparência LGPD — sujeito à validação jurídica formal pela Garagem Mailasque.</span>
        </div>

        {/* Conteúdo do Documento */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
          {isPrivacy ? (
            <>
              <p>
                A <strong className="text-[#F5F5F5]">Garagem Mailasque</strong> (CNPJ {businessData.cnpj}), com sede na {businessData.address.fullFormatted}, é a <strong className="text-[#F5F5F5]">controladora</strong> dos dados pessoais tratados através deste website.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">1. Dados coletados</h3>
              <p>
                Coletamos estritamente os dados preenchidos voluntariamente pelo usuário em nosso formulário de solicitação de orçamento:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#C9CDD2]">
                <li>Nome completo (para identificação no contato);</li>
                <li>Número de telefone celular / WhatsApp com DDD (para envio da proposta de orçamento);</li>
                <li>Serviço desejado, modelo e ano do veículo (para estimativa preliminar de serviços);</li>
                <li>Informação sobre atendimento particular ou por seguradora.</li>
              </ul>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">2. Finalidade do tratamento</h3>
              <p>
                Os dados fornecidos são utilizados <strong className="text-[#F5F5F5]">exclusivamente</strong> para permitir que nossa equipe entre em contato com você via WhatsApp, analise os danos e elabore o orçamento comercial solicitado. Não realizamos venda de dados, disparo de spam ou compartilhamento com terceiros não autorizados.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">3. Como os dados são transmitidos</h3>
              <p>
                Nosso formulário opera sem armazenamento em banco de dados intermediário próprio: ao submeter o formulário, as informações são estruturadas em uma mensagem de texto e abertas diretamente no aplicativo oficial do WhatsApp no seu dispositivo, garantindo criptografia de ponta a ponta na conversa.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">4. Seus direitos (LGPD)</h3>
              <p>
                Você tem o direito de solicitar a confirmação, o acesso, a correção ou a exclusão dos seus dados mantidos em nossos registros de mensagens comerciais a qualquer momento. Basta entrar em contato pelo WhatsApp oficial ({businessData.phone}).
              </p>
            </>
          ) : (
            <>
              <p>
                Bem-vindo ao site institucional da <strong className="text-[#F5F5F5]">Garagem Mailasque</strong>. Ao acessar este portal, você concorda com os termos e condições aqui estabelecidos.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">1. Natureza das informações e orçamentos</h3>
              <p>
                As informações, ilustrações de simulação de parcelamento e dados de serviços apresentados neste site têm caráter exclusivamente informativo e de referência preliminar. O valor final, condições técnicas e prazos exatos para qualquer serviço de funilaria, pintura ou martelinho são determinados exclusivamente após avaliação e orçamento individualizado do veículo.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">2. Propriedade intelectual e imagens</h3>
              <p>
                As fotos das instalações, vídeos dos processos e a marca da Garagem Mailasque são de uso exclusivo da oficina. É vedada a reprodução, cópia ou reutilização de qualquer elemento gráfico ou audiovisual sem autorização prévia por escrito.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">3. Atendimento a seguradoras</h3>
              <p>
                O atendimento a sinistros de seguradoras obedece às normas da Superintendência de Seguros Privados (SUSEP), respeitando sempre a prerrogativa do proprietário do veículo de indicar a oficina de sua preferência.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">4. Foro e legislação aplicável</h3>
              <p>
                Estes termos são regidos pelas leis da República Federativa do Brasil, elegendo-se o foro da Comarca de São Roque/SP para dirimir eventuais controvérsias.
              </p>
            </>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t border-[#2C2C2C] bg-[#1A1A1A] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-[#F5F5F5] font-semibold text-xs transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
          >
            Entendido e fechar
          </button>
        </div>
      </div>
    </div>
  );
};
