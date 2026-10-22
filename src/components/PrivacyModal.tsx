import React, { useEffect, useRef, useState } from 'react';
import { X, Shield, FileText, Cookie, Settings2, Check, ExternalLink } from 'lucide-react';
import { businessData } from '../data/business';
import {
  getCookiePreferences,
  saveCookiePreferences,
  initAnalyticsIfConsented,
  setStoredConsent,
} from '../utils/analytics';

export type LegalDocType = 'privacy' | 'terms' | 'cookies' | 'cookie-settings';

interface PrivacyModalProps {
  type: LegalDocType;
  isOpen: boolean;
  onClose: () => void;
  onTypeChange?: (newType: LegalDocType) => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  type,
  isOpen,
  onClose,
  onTypeChange,
}) => {
  const [activeTab, setActiveTab] = useState<LegalDocType>(type);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const [marketingAllowed, setMarketingAllowed] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Sincroniza a aba ativa quando a prop 'type' mudar ao abrir
  useEffect(() => {
    setActiveTab(type);
    setSavedFeedback(false);
    if (isOpen) {
      const currentPrefs = getCookiePreferences();
      setAnalyticsAllowed(currentPrefs.analytics);
      setMarketingAllowed(currentPrefs.marketing);
    }
  }, [type, isOpen]);

  const handleTabClick = (newTab: LegalDocType) => {
    setActiveTab(newTab);
    setSavedFeedback(false);
    if (onTypeChange) {
      onTypeChange(newTab);
    }
  };

  const handleSavePreferences = () => {
    saveCookiePreferences({
      analytics: analyticsAllowed,
      marketing: marketingAllowed,
    });
    if (analyticsAllowed || marketingAllowed) {
      initAnalyticsIfConsented();
    }
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
    }, 2500);
  };

  const handleAcceptAll = () => {
    setAnalyticsAllowed(true);
    setMarketingAllowed(true);
    setStoredConsent('granted');
    saveCookiePreferences({
      analytics: true,
      marketing: true,
    });
    initAnalyticsIfConsented();
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
    }, 2500);
  };

  const handleRejectNonEssential = () => {
    setAnalyticsAllowed(false);
    setMarketingAllowed(false);
    setStoredConsent('denied');
    saveCookiePreferences({
      analytics: false,
      marketing: false,
    });
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
    }, 2500);
  };

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#141414] border border-[#2C2C2C] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Topo do Modal com Seleção de Abas */}
        <div className="p-4 sm:p-6 border-b border-[#2C2C2C] bg-[#1A1A1A] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {activeTab === 'privacy' && <Shield className="w-5 h-5 text-[#F97316]" aria-hidden="true" />}
              {activeTab === 'terms' && <FileText className="w-5 h-5 text-[#F97316]" aria-hidden="true" />}
              {activeTab === 'cookies' && <Cookie className="w-5 h-5 text-[#F97316]" aria-hidden="true" />}
              {activeTab === 'cookie-settings' && <Settings2 className="w-5 h-5 text-[#F97316]" aria-hidden="true" />}
              <h2 id="legal-modal-title" className="text-base sm:text-lg font-bold text-[#F5F5F5]">
                {activeTab === 'privacy' && 'Política de Privacidade & LGPD'}
                {activeTab === 'terms' && 'Termos de Uso'}
                {activeTab === 'cookies' && 'Política de Cookies'}
                {activeTab === 'cookie-settings' && 'Configuração de Cookies & Privacidade'}
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

          {/* Abas de Navegação entre Documentos */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-[#111111] border border-[#2C2C2C] rounded-xl">
            <button
              type="button"
              onClick={() => handleTabClick('privacy')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F97316] ${
                activeTab === 'privacy'
                  ? 'bg-[#F97316] text-[#0A0A0A] font-bold shadow-sm'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#222222]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Privacidade & LGPD</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('terms')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F97316] ${
                activeTab === 'terms'
                  ? 'bg-[#F97316] text-[#0A0A0A] font-bold shadow-sm'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#222222]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Termos de Uso</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('cookies')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F97316] ${
                activeTab === 'cookies'
                  ? 'bg-[#F97316] text-[#0A0A0A] font-bold shadow-sm'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#222222]'
              }`}
            >
              <Cookie className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Política de Cookies</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('cookie-settings')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F97316] ${
                activeTab === 'cookie-settings'
                  ? 'bg-[#F97316] text-[#0A0A0A] font-bold shadow-sm'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#222222]'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Configurar Cookies</span>
            </button>
          </div>
        </div>

        {/* Conteúdo do Documento */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
          {/* ABA 1: POLÍTICA DE PRIVACIDADE & LGPD */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2C2C2C] text-[#F5F5F5] space-y-1">
                <p className="font-bold text-sm text-[#F97316]">Controlador de Dados Pessoais:</p>
                <p className="text-xs sm:text-sm">
                  <strong>Garagem Mailasque Ltda.</strong> · CNPJ: {businessData.cnpj}
                </p>
                <p className="text-xs text-[#A3A3A3]">{businessData.address.fullFormatted}</p>
                <p className="text-xs text-[#A3A3A3]">Canal de Atendimento: WhatsApp oficial {businessData.phone}</p>
              </div>

              <p>
                Esta Política de Privacidade foi elaborada em estrita conformidade com a{' '}
                <strong className="text-[#F5F5F5]">Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD)</strong>{' '}
                e o Marco Civil da Internet (Lei nº 12.965/2014), estabelecendo com total transparência como a Garagem Mailasque
                trata dados pessoais ao disponibilizar este website institucional e os canais de atendimento comercial.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">1. Dados Pessoais Tratados e Forma de Coleta</h3>
              <p>
                A Garagem Mailasque atua sob o princípio da necessidade e minimização de dados, coletando exclusivamente as informações essenciais para atender à sua solicitação de orçamento técnico e contato comercial:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#C9CDD2]">
                <li>
                  <strong className="text-[#F5F5F5]">Identificação e Contato:</strong> Nome completo e telefone celular com DDD (WhatsApp), fornecidos voluntariamente pelo usuário ao preencher o formulário ou iniciar contato direto.
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Dados do Veículo e do Serviço:</strong> Marca, modelo, ano de fabricação, serviço desejado (ex.: funilaria, pintura na estufa, martelinho de ouro, sinistro) e fotos ou descrição dos danos para pré-avaliação.
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Informações de Sinistro (quando aplicável):</strong> Indicação de atendimento particular ou através de seguradora parceira / associação veicular.
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Métricas de Acesso Pseudonimizadas:</strong> Dados técnicos estritamente agregados de navegação (páginas visitadas, horário, resolução de tela) coletados somente mediante seu consentimento prévio em nossa Política de Cookies.
                </li>
              </ul>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">2. Finalidades e Bases Legais do Tratamento</h3>
              <p>O tratamento dos seus dados ocorre fundamentado nas seguintes bases legais estabelecidas pela LGPD:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#C9CDD2]">
                <li>
                  <strong className="text-[#F5F5F5]">Execução de Procedimentos Preliminares a Contrato (Art. 7º, V, LGPD):</strong> Elaboração, cálculo técnico e envio de orçamentos solicitados pelo próprio titular para conserto, pintura ou funilaria veicular.
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Legítimo Interesse (Art. 7º, IX, LGPD):</strong> Atendimento personalizado a dúvidas de clientes via WhatsApp e garantia da segurança e integridade operacional do website.
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Consentimento Expresso (Art. 7º, I, LGPD):</strong> Para a ativação de cookies analíticos e de mensuração de tráfego, podendo ser revogado a qualquer tempo.
                </li>
              </ul>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">3. Arquitetura Segura e Compartilhamento de Dados</h3>
              <p>
                Nosso formulário opera com máxima privacidade: as informações digitadas são formatadas em mensagem de texto estruturada e transmitidas diretamente para o aplicativo oficial do WhatsApp no seu dispositivo, valendo-se da criptografia de ponta a ponta nativa da plataforma.
              </p>
              <p>
                <strong className="text-[#F5F5F5]">A Garagem Mailasque não comercializa, não aluga e não cede seus dados pessoais</strong> para terceiros, empresas de marketing ou listas de telemarketing sob nenhuma hipótese. O compartilhamento ocorre apenas quando indispensável à execução do serviço (ex.: com seguradoras e fornecedores de peças originais, estritamente com sua anuência formal na Ordem de Serviço).
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">4. Prazo de Armazenamento e Retenção</h3>
              <p>
                Os dados de contato fornecidos em orçamentos não contratados são descartados periodicamente. Dados vinculados a ordens de serviço executadas, garantias de pintura e notas fiscais são guardados pelo prazo legal exigido pelo Código de Defesa do Consumidor e legislação tributária brasileira.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">5. Seus Direitos como Titular de Dados (Art. 18, LGPD)</h3>
              <p>Você possui o direito garantido de solicitar à Garagem Mailasque, a qualquer momento e sem custos:</p>
              <ul className="list-disc pl-5 space-y-1 text-[#C9CDD2]">
                <li>Confirmação da existência de tratamento e acesso aos seus dados;</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
                <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a LGPD;</li>
                <li>Eliminação dos dados pessoais tratados com seu consentimento;</li>
                <li>Revogação do consentimento concedido anteriormente.</li>
              </ul>
              <p className="pt-1">
                Para exercer seus direitos, basta entrar em contato com nossa administração pelo WhatsApp ({businessData.phone}) ou presencialmente em nossa oficina.
              </p>
            </div>
          )}

          {/* ABA 2: TERMOS DE USO */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <p>
                Bem-vindo ao website oficial da <strong className="text-[#F5F5F5]">Garagem Mailasque</strong>. Ao navegar por este portal ou utilizar nossos formulários e botões de contato, você expressa sua concordância com os presentes Termos de Uso.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">1. Natureza Informativa e Estimativa Preliminar</h3>
              <p>
                Todo o conteúdo, fotos de instalações, vídeos de procedimentos técnicos e valores referenciais presentes neste site têm finalidade estritamente institucional e informativa.
              </p>
              <p>
                <strong className="text-[#F5F5F5]">Orçamentos e diagnósticos definitivos:</strong> Valores exatos, prazos de entrega, necessidade de substituição de peças e cronograma de trabalho são estabelecidos unicamente após avaliação técnica presencial do veículo em nossa oficina, com formalização de Ordem de Serviço detalhada.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">2. Direito do Consumidor e Atendimento a Seguradoras</h3>
              <p>
                Em conformidade com a regulamentação da SUSEP (Superintendência de Seguros Privados) e o Código de Defesa do Consumidor (Lei nº 8.078/1990), o segurado ou terceiro envolvido em sinistro possui o{' '}
                <strong className="text-[#F5F5F5]">direito legal e irrevogável de escolher a oficina de sua livre confiança</strong> para o reparo do veículo, não sendo obrigado a utilizar oficinas credenciadas impostas por seguradoras.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">3. Condições de Pagamento e Simulações</h3>
              <p>
                As simulações de parcelamento em até 3x sem juros no cartão e as condições de desconto à vista via PIX ou dinheiro representam facilidades comerciais sujeitas a confirmação no fechamento da ordem de serviço, podendo variar em serviços que envolvam peças especiais ou serviços de terceiros.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">4. Propriedade Intelectual</h3>
              <p>
                A marca Garagem Mailasque, o logotipo, o design do website, as fotos da oficina, os retratos da equipe e as filmagens de processos na estufa de pintura são de titularidade exclusiva da oficina. É estritamente vedada a reprodução total ou parcial, download não autorizado, cópia ou veiculação comercial sem consentimento prévio por escrito.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">5. Links Externos e Navegação</h3>
              <p>
                Este site oferece links de conveniência para serviços de terceiros, incluindo WhatsApp, Google Maps, Waze, Instagram e Facebook. A Garagem Mailasque não controla e não é responsável pelos termos, disponibilidade técnica ou políticas de terceiros ao sair deste domínio.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">6. Foro e Legislação Aplicável</h3>
              <p>
                Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Para dirimir quaisquer litígios, fica eleito com exclusividade o Foro da Comarca de São Roque, Estado de São Paulo.
              </p>
            </div>
          )}

          {/* ABA 3: POLÍTICA DE COOKIES */}
          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <p>
                A <strong className="text-[#F5F5F5]">Política de Cookies da Garagem Mailasque</strong> explica de forma transparente como utilizamos cookies e tecnologias de armazenamento local para viabilizar o funcionamento seguro do nosso site e respeitar sua privacidade conforme a LGPD.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">1. O que são Cookies?</h3>
              <p>
                Cookies são pequenos arquivos de texto armazenados no seu computador ou celular pelo navegador quando você visita uma página web. Eles servem para lembrar suas ações e preferências (como o consentimento de privacidade), viabilizar segurança e ajudar a entender como o site é utilizado de forma anônima.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">2. Categorias de Cookies Utilizados neste Website</h3>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#1A1A1A] border border-[#2C2C2C]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-[#F5F5F5]">A. Cookies Estritamente Necessários</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#262626] text-[#22C55E] border border-[#22C55E]/30">
                      Sempre Ativos
                    </span>
                  </div>
                  <p className="text-xs text-[#A3A3A3]">
                    Indispensáveis para a navegação, segurança, estabilidade da página e para gravar se você aceitou ou recusou métricas de privacidade. Não armazenam dados identificáveis e não podem ser desativados sem comprometer a navegação.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1A1A1A] border border-[#2C2C2C]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-[#F5F5F5]">B. Cookies de Análise e Desempenho (Opcionais)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#262626] text-[#F97316] border border-[#F97316]/30">
                      Requer Consentimento
                    </span>
                  </div>
                  <p className="text-xs text-[#A3A3A3]">
                    Utilizados por ferramentas como o Google Analytics 4 para registrar métricas agregadas e anônimas (ex.: páginas mais acessadas, tempo de permanência, tipo de aparelho). Ajudam a otimizar a velocidade e a usabilidade do site sem identificar o titular pessoalmente.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1A1A1A] border border-[#2C2C2C]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-[#F5F5F5]">C. Cookies de Conversão e Marketing (Opcionais)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#262626] text-[#F97316] border border-[#F97316]/30">
                      Requer Consentimento
                    </span>
                  </div>
                  <p className="text-xs text-[#A3A3A3]">
                    Aplicados somente quando veiculamos campanhas de divulgação local (Google Ads / Meta Ads) para verificar se anúncios resultaram em cliques para orçamento, sem gerar perfis invasivos de navegação.
                  </p>
                </div>
              </div>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">3. Como Gerenciar ou Revogar seu Consentimento</h3>
              <p>
                Você tem autonomia total para mudar suas preferências a qualquer momento:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#C9CDD2]">
                <li>
                  <strong className="text-[#F5F5F5]">Painel de Preferências deste site:</strong> Clique na aba{' '}
                  <button
                    type="button"
                    onClick={() => handleTabClick('cookie-settings')}
                    className="text-[#F97316] underline font-semibold hover:text-[#EA580C]"
                  >
                    Configurar Cookies
                  </button>{' '}
                  neste modal ou no link correspondente no rodapé para ativar ou desativar categorias opcionais instantaneamente.
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Configurações do Navegador:</strong> Todos os navegadores (Chrome, Safari, Firefox, Edge) permitem apagar cookies existentes ou bloquear cookies de terceiros no menu de Privacidade e Segurança.
                </li>
              </ul>
            </div>
          )}

          {/* ABA 4: CONFIGURAÇÃO DE COOKIES INTERATIVA */}
          {activeTab === 'cookie-settings' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2C2C2C]">
                <p className="text-xs sm:text-sm text-[#F5F5F5] font-semibold mb-1">
                  Gerenciador de Preferências de Privacidade
                </p>
                <p className="text-xs text-[#A3A3A3]">
                  Personalize quais categorias de cookies você autoriza durante a sua visita à Garagem Mailasque. Você pode alterar essas opções sempre que desejar.
                </p>
              </div>

              {/* Lista de Toggles de Categorias */}
              <div className="space-y-3">
                {/* 1. Necessários */}
                <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2C2C2C] flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-[#F5F5F5]">Cookies Estritamente Necessários</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#173020] text-[#22C55E] border border-[#22C55E]/40">
                        Obrigatórios
                      </span>
                    </div>
                    <p className="text-xs text-[#A3A3A3] leading-relaxed">
                      Garantem segurança contra spam, estabilidade técnica na navegação e gravam suas escolhas de privacidade. Não podem ser desligados.
                    </p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      aria-label="Cookies necessários sempre ativos"
                      className="w-5 h-5 rounded accent-[#22C55E] cursor-not-allowed opacity-80"
                    />
                  </div>
                </div>

                {/* 2. Analíticos */}
                <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2C2C2C] flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-[#F5F5F5]">Cookies de Análise e Métricas (GA4)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#262626] text-[#C9CDD2]">
                        Opcional
                      </span>
                    </div>
                    <p className="text-xs text-[#A3A3A3] leading-relaxed">
                      Permitem mensurar o volume de acessos de forma pseudonimizada e estatística, identificando melhorias técnicas na landing page.
                    </p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={analyticsAllowed}
                        onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#2C2C2C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F97316]"></div>
                    </label>
                  </div>
                </div>

                {/* 3. Marketing */}
                <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2C2C2C] flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-[#F5F5F5]">Cookies de Conversão e Marketing</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#262626] text-[#C9CDD2]">
                        Opcional
                      </span>
                    </div>
                    <p className="text-xs text-[#A3A3A3] leading-relaxed">
                      Auxiliam no acompanhamento de campanhas e na eficácia dos botões de contato de orçamento.
                    </p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketingAllowed}
                        onChange={(e) => setMarketingAllowed(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#2C2C2C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F97316]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Feedback visual de sucesso */}
              {savedFeedback && (
                <div className="p-3 rounded-lg bg-[#142918] border border-[#22C55E]/40 text-[#22C55E] text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Suas preferências de cookies foram salvas com sucesso!</span>
                </div>
              )}

              {/* Botões de Ação do Painel */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] font-bold text-xs tracking-wide transition-colors shadow-md focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
                >
                  Salvar Minhas Preferências
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-[#F5F5F5] font-semibold text-xs transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
                >
                  Aceitar Todos
                </button>
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-[#333333] hover:bg-[#222222] text-[#A3A3A3] hover:text-[#F5F5F5] font-medium text-xs transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
                >
                  Rejeitar Opcionais
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t border-[#2C2C2C] bg-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#737373] text-center sm:text-left">
            Dúvidas sobre seus dados? Fale conosco pelo WhatsApp oficial {businessData.phone}.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-[#F5F5F5] font-semibold text-xs transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
