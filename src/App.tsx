/**
 * Landing Page de Alta Conversão — Garagem Mailasque
 * Oficina especializada em funilaria e pintura automotiva em Mailasqui, São Roque/SP.
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
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
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { PrivacyModal, LegalDocType } from './components/PrivacyModal';
import { CookieConsent } from './components/CookieConsent';

export default function App() {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<LegalDocType>('privacy');

  const handleOpenPrivacy = () => {
    setLegalDocType('privacy');
    setLegalModalOpen(true);
  };

  const handleOpenTerms = () => {
    setLegalDocType('terms');
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#F5F5F5] flex flex-col font-body selection:bg-[#F97316] selection:text-[#0A0A0A]">
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
      <Footer onOpenPrivacyModal={handleOpenPrivacy} onOpenTermsModal={handleOpenTerms} />

      {/* 14. Botão Flutuante do WhatsApp */}
      <FloatingWhatsApp />

      {/* 15. Modal de Documentos Legais (Privacidade e Termos) */}
      <PrivacyModal
        type={legalDocType}
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
      />

      {/* 16. Banner de Consentimento LGPD (somente quando há IDs analíticos) */}
      <CookieConsent onOpenPrivacyModal={handleOpenPrivacy} />
    </div>
  );
}
