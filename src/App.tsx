/**
 * Landing Page de Alta Conversão — Garagem Mailasque
 * Oficina especializada em funilaria e pintura automotiva em Mailasqui, São Roque/SP.
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Insurers } from './components/Insurers';
import { Workflow } from './components/Workflow';
import { Gallery } from './components/Gallery';
import { Testimonials } from './components/Testimonials';
import { PaymentSimulator } from './components/PaymentSimulator';
import { PartnerApvs } from './components/PartnerApvs';
import { QuoteForm } from './components/QuoteForm';
import { Faq } from './components/Faq';
import { Location } from './components/Location';
import { Footer } from './components/Footer';
import { PrivacyModal, LegalDocType } from './components/PrivacyModal';
import { CookieConsent } from './components/CookieConsent';

// Lazy loading do FloatingWhatsApp para priorizar o carregamento e renderização do LCP (conteúdo principal)
const FloatingWhatsApp = lazy(() => import('./components/FloatingWhatsApp'));

export default function App() {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<LegalDocType>('privacy');
  const [canLoadWhatsApp, setCanLoadWhatsApp] = useState(false);

  const handleOpenPrivacy = () => {
    setLegalDocType('privacy');
    setLegalModalOpen(true);
  };

  const handleOpenTerms = () => {
    setLegalDocType('terms');
    setLegalModalOpen(true);
  };

  const handleOpenCookies = () => {
    setLegalDocType('cookies');
    setLegalModalOpen(true);
  };

  const handleOpenCookieSettings = () => {
    setLegalDocType('cookie-settings');
    setLegalModalOpen(true);
  };

  useEffect(() => {
    // Carregamento diferido (lazy) para não competir com o LCP do Hero e conteúdo principal
    const scheduleLoad = () => {
      if ('requestIdleCallback' in window) {
        const id = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
          .requestIdleCallback(() => setCanLoadWhatsApp(true), { timeout: 1000 });
        return () => {
          if ('cancelIdleCallback' in window) {
            (window as unknown as { cancelIdleCallback: (i: number) => void }).cancelIdleCallback(id);
          }
        };
      } else {
        const timer = setTimeout(() => setCanLoadWhatsApp(true), 300);
        return () => clearTimeout(timer);
      }
    };

    if (document.readyState === 'complete') {
      return scheduleLoad();
    } else {
      const handleLoad = () => scheduleLoad();
      window.addEventListener('load', handleLoad, { once: true });
      const fallbackTimer = setTimeout(scheduleLoad, 800);
      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(fallbackTimer);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#F5F5F5] flex flex-col font-body selection:bg-[#F97316] selection:text-[#0A0A0A]">
      {/* Barra de progresso de leitura fixa no topo da página */}
      <ScrollProgressBar />

      {/* 1. Header fixo com Top Bar Contract */}
      <Header />

      {/* Conteúdo Principal com landmark semântico */}
      <main id="conteudo-principal" className="flex-1">
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Serviços (4 cards especializados) */}
        <Services />

        {/* 4. Seguradoras (Seu carro, sua escolha de oficina) */}
        <Insurers />

        {/* 5. Diferenciais / Como Funciona */}
        <Workflow />

        {/* 6. Galeria da Oficina (Fotos & Vídeos Reais com Lightbox) */}
        <Gallery />

        {/* 7. Avaliações (Nota 4,9 no Google / 79 avaliações) */}
        <Testimonials />

        {/* 8. Condições de Pagamento & Simulador Interativo */}
        <PaymentSimulator />

        {/* 9. Parceria APVS Brasil */}
        <PartnerApvs />

        {/* 10. Formulário de Orçamento com Validação */}
        <QuoteForm onOpenPrivacyModal={handleOpenPrivacy} />

        {/* 11. FAQ (Perguntas Frequentes) */}
        <Faq />

        {/* 12. Localização, Acessibilidade e Mapa */}
        <Location />
      </main>

      {/* 13. Rodapé Completo */}
      <Footer
        onOpenPrivacyModal={handleOpenPrivacy}
        onOpenTermsModal={handleOpenTerms}
        onOpenCookiesPolicyModal={handleOpenCookies}
        onOpenCookieSettingsModal={handleOpenCookieSettings}
      />

      {/* 14. Botão Flutuante do WhatsApp (Lazy Loading diferido para otimizar LCP) */}
      {canLoadWhatsApp && (
        <Suspense fallback={null}>
          <FloatingWhatsApp />
        </Suspense>
      )}

      {/* 15. Modal de Documentos Legais e Configuração de Cookies */}
      <PrivacyModal
        type={legalDocType}
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        onTypeChange={(newType) => setLegalDocType(newType)}
      />

      {/* 16. Banner de Consentimento LGPD (somente quando há IDs analíticos) */}
      <CookieConsent
        onOpenPrivacyModal={handleOpenPrivacy}
        onOpenCookiesPolicyModal={handleOpenCookies}
        onOpenCookieSettingsModal={handleOpenCookieSettings}
      />
    </div>
  );
}
