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
                Esta Política de Privacidade foi elaborada considerando as diretrizes da{' '}
                <strong className="text-[#F5F5F5]">Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD)</strong>{' '}
                e do Marco Civil da Internet (Lei nº 12.965/2014), apresentando de forma transparente como a Garagem Mailasque
                trata dados pessoais ao disponibilizar este website institucional e os canais de atendimento comercial.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">1. Dados Pessoais Tratados e Forma de Coleta</h3>
              <p>
                A Garagem Mailasque atua sob o princípio da necessidade e minimização de dados, solicitando apenas as informações essenciais para atender à sua solicitação de orçamento técnico e contato comercial:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#C9CDD2]">
                <li>
                  <strong className="text-[#F5F5F5]">Formulário de Orçamento no Site:</strong> Solicita exclusivamente seu nome, modelo do veículo, ano (opcional), serviço desejado, peças ou regiões a reparar (opcional), observações sobre o dano (opcional) e a indicação de atendimento particular ou por seguradora. <strong className="text-[#F5F5F5]">O formulário do site não coleta seu número de telefone.</strong>
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Atendimento via WhatsApp:</strong> Ao clicar nos botões de orçamento ou enviar o formulário, o site gera uma mensagem de texto estruturada e redireciona você para o aplicativo ou página oficial do WhatsApp. Somente quando você inicia e envia a conversa no WhatsApp é que seu número de telefone, perfil público e eventuais fotos ou mensagens enviadas diretamente na conversa passam a ser visíveis para a nossa equipe de atendimento.
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Métricas de Navegação e Conversão (Mediante Consentimento):</strong> Eventos técnicos de interação e cliques de conversão gerenciados pelo Google Tag Manager (GTM), acionados somente se você autorizar as categorias opcionais de Análise (Google Analytics 4) e/ou Marketing (Google Ads) no controle de cookies. Nenhum dado pessoal digitado no formulário ou no chat (como nome, telefone, placa ou texto da mensagem) é enviado para ferramentas de análise ou publicidade.
                </li>
              </ul>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">2. Finalidades e Bases Legais do Tratamento</h3>
              <p>O tratamento dos dados ocorre com base nas seguintes hipóteses previstas na LGPD:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#C9CDD2]">
                <li>
                  <strong className="text-[#F5F5F5]">Execução de Procedimentos Preliminares a Contrato (Art. 7º, V, LGPD):</strong> Elaboração, avaliação técnica preliminar e resposta a pedidos de orçamento solicitados pelo próprio titular para serviços de funilaria, pintura ou estética automotiva.
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Legítimo Interesse (Art. 7º, IX, LGPD):</strong> Atendimento a dúvidas comerciais iniciadas voluntariamente pelo cliente e manutenção da segurança e estabilidade operacional do website.
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Consentimento (Art. 7º, I, LGPD):</strong> Para o carregamento do Google Tag Manager e ativação de tags opcionais de Análise e/ou Marketing, podendo ser gerenciado ou revogado a qualquer momento no painel de cookies do site.
                </li>
              </ul>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">3. Serviços Externos, Infraestrutura e Compartilhamento</h3>
              <p>
                O formulário e o chat flutuante do site não armazenam suas mensagens em banco de dados próprio no servidor web: o texto é preparado localmente no seu navegador para abertura direta no WhatsApp.
              </p>
              <p>
                Para o funcionamento técnico do site e das funcionalidades acionadas pelo visitante, são utilizados os seguintes serviços e provedores:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#C9CDD2]">
                <li>
                  <strong className="text-[#F5F5F5]">Hospedagem Web (Netlify):</strong> Este site é hospedado na infraestrutura da Netlify, que processa automaticamente registros técnicos padrão de conexão (como endereço IP, data/hora e cabeçalhos do navegador) necessários para entregar as páginas com segurança.
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Tipografia Externa (Google Fonts):</strong> As fontes visuais do site são carregadas a partir dos servidores do Google (<code className="text-[#F5F5F5]">fonts.googleapis.com</code> e <code className="text-[#F5F5F5]">fonts.gstatic.com</code>), o que envolve uma requisição técnica padrão do seu navegador para exibição correta dos textos.
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Mapa Interativo Sob Demanda (Google Maps):</strong> Na seção de localização, o mapa interativo do Google Maps não é carregado automaticamente. A conexão com os servidores do Google Maps só ocorre se você clicar expressamente no botão <em>&ldquo;Carregar mapa interativo&rdquo;</em> ou optar por abrir os links externos de rota.
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Mensuração e Publicidade (Google Tag Manager, GA4 e Google Ads):</strong> O container do Google Tag Manager só é carregado após o seu consentimento opcional, respeitando o padrão Google Consent Mode v2.
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Comunicação Externa (WhatsApp):</strong> Acionado exclusivamente quando você clica em um botão de contato para conversar com a oficina.
                </li>
              </ul>
              <p>
                <strong className="text-[#F5F5F5]">A Garagem Mailasque não comercializa e não aluga seus dados pessoais.</strong> Provedores de infraestrutura e tecnologia listados acima operam sob suas respectivas políticas de privacidade e podem processar dados técnicos em servidores localizados no Brasil ou no exterior, conforme a arquitetura de cada serviço. No atendimento presencial da oficina, dados estritamente necessários poderão ser compartilhados com seguradoras ou fornecedores de peças mediante sua ciência na Ordem de Serviço.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">4. Prazo de Armazenamento e Retenção</h3>
              <p>
                No navegador do visitante, o site armazena apenas as chaves locais de preferência de privacidade (<code className="text-[#F5F5F5]">gm_cookie_preferences_v2</code> e <code className="text-[#F5F5F5]">gm_cookie_consent_v1</code>). Os dados informados em conversas de WhatsApp para orçamentos e eventuais ordens de serviço contratadas são mantidos pela oficina pelo tempo necessário ao atendimento comercial, cumprimento de garantias de serviço e obrigações fiscais e legais aplicáveis.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">5. Seus Direitos como Titular de Dados (Art. 18, LGPD)</h3>
              <p>Nos termos da LGPD, você pode solicitar à Garagem Mailasque, a qualquer momento:</p>
              <ul className="list-disc pl-5 space-y-1 text-[#C9CDD2]">
                <li>Confirmação da existência de tratamento e acesso aos seus dados pessoais;</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
                <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
                <li>Eliminação dos dados pessoais tratados com base no seu consentimento, quando aplicável;</li>
                <li>Informação sobre o compartilhamento de dados e revogação do consentimento a qualquer momento.</li>
              </ul>
              <p className="pt-1">
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato pelo WhatsApp oficial ({businessData.phone}) ou presencialmente em nosso endereço em Mailasqui, São Roque/SP.
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
                A <strong className="text-[#F5F5F5]">Política de Cookies da Garagem Mailasque</strong> explica de forma transparente como utilizamos cookies e tecnologias de armazenamento local (<code className="text-[#F5F5F5]">localStorage</code>) para viabilizar o funcionamento seguro do nosso site e respeitar suas escolhas de privacidade.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">1. O que são Cookies e Armazenamento Local?</h3>
              <p>
                Cookies e chaves de armazenamento local são pequenos registros salvos no seu navegador quando você visita uma página web. Eles servem para lembrar suas escolhas de privacidade e, somente se você autorizar, permitir a mensuração estatística de visitas e de conversões de anúncios.
              </p>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">2. Categorias Utilizadas neste Website</h3>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#1A1A1A] border border-[#2C2C2C]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-[#F5F5F5]">A. Armazenamento Estritamente Necessário</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#262626] text-[#22C55E] border border-[#22C55E]/30">
                      Sempre Ativos
                    </span>
                  </div>
                  <p className="text-xs text-[#A3A3A3]">
                    Indispensável para gravar no seu navegador (<code className="text-[#F5F5F5]">gm_cookie_preferences_v2</code> e <code className="text-[#F5F5F5]">gm_cookie_consent_v1</code>) se você aceitou, recusou ou personalizou as categorias opcionais. Sem esse registro, o banner de consentimento reapareceria a cada interação. Não armazena dados pessoais identificáveis.
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
                    Gerenciados via Google Tag Manager (GTM) para habilitar o Google Analytics 4 (<code className="text-[#F5F5F5]">analytics_storage</code>) quando autorizados pelo visitante. Permitem medir estatísticas agregadas de navegação e eventos de interação na página sem enviar nome, telefone, placa ou conteúdo de mensagens.
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
                    Gerenciados via Google Tag Manager (GTM) para mensuração de conversões de campanhas no Google Ads (<code className="text-[#F5F5F5]">ad_storage</code>, <code className="text-[#F5F5F5]">ad_user_data</code> e <code className="text-[#F5F5F5]">ad_personalization</code>) quando autorizados pelo visitante, permitindo verificar se um anúncio gerou cliques de contato para orçamento.
                  </p>
                </div>
              </div>

              <h3 className="text-base font-bold text-[#F5F5F5] pt-2">3. Como Gerenciar ou Revogar seu Consentimento</h3>
              <p>
                Por padrão, todas as categorias opcionais iniciam desativadas. Você tem autonomia para alterar ou revogar sua escolha a qualquer momento:
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
                  neste modal ou no botão correspondente no rodapé do site para ativar, personalizar ou rejeitar as categorias opcionais imediatamente.
                </li>
                <li>
                  <strong className="text-[#F5F5F5]">Configurações do Navegador:</strong> Você também pode apagar os cookies e dados de sites salvos diretamente nas configurações de Privacidade e Segurança do seu navegador (Chrome, Safari, Firefox, Edge).
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

export default PrivacyModal;
