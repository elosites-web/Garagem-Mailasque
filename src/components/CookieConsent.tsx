import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import {
  hasAnalyticsConfigured,
  getStoredConsent,
  setStoredConsent,
  initAnalyticsIfConsented,
} from '../utils/analytics';

interface CookieConsentProps {
  onOpenPrivacyModal?: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onOpenPrivacyModal }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Só exibe se houver IDs de analítica configurados via variáveis de ambiente
    if (!hasAnalyticsConfigured()) {
      return;
    }

    const consent = getStoredConsent();
    if (consent === 'pending') {
      setIsVisible(true);
    } else if (consent === 'granted') {
      initAnalyticsIfConsented();
    }
  }, []);

  const handleAccept = () => {
    setStoredConsent('granted');
    setIsVisible(false);
    initAnalyticsIfConsented();
  };

  const handleDecline = () => {
    setStoredConsent('denied');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Consentimento de cookies e privacidade"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-[#171717]/95 backdrop-blur-md border-t border-[#2C2C2C] shadow-2xl"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3 text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
          <Shield className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Utilizamos cookies e tecnologias de mensuração para analisar o tráfego e aprimorar sua experiência neste site, de acordo com nossa{' '}
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              className="text-[#F97316] underline hover:text-[#EA580C] focus-visible:outline-2 focus-visible:outline-[#F97316]"
            >
              Política de Privacidade
            </button>
            . Você pode aceitar ou recusar essas métricas.
          </p>
        </div>

        {/* Botões com mesma ênfase visual conforme diretriz LGPD */}
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border border-[#383838] bg-[#222222] hover:bg-[#2A2A2A] text-[#F5F5F5] font-semibold text-xs tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
          >
            Recusar métricas
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border border-[#F97316] bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] font-bold text-xs tracking-wide transition-colors shadow-md focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
          >
            Aceitar e continuar
          </button>
        </div>
      </div>
    </aside>
  );
};
