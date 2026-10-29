import React, { useState, useEffect } from 'react';
import { Shield, Settings } from 'lucide-react';
import {
  getStoredConsent,
  saveCookiePreferences,
  initAnalyticsIfConsented,
  setupDefaultConsentMode,
  CONSENT_EVENT_NAME,
} from '../utils/analytics';

interface CookieConsentProps {
  onOpenPrivacyModal?: () => void;
  onOpenCookiesPolicyModal?: () => void;
  onOpenCookieSettingsModal?: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({
  onOpenPrivacyModal,
  onOpenCookiesPolicyModal,
  onOpenCookieSettingsModal,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Registra estado padrão de Consent Mode v2 antes do disparo de quaisquer tags
    setupDefaultConsentMode();

    const syncConsentState = () => {
      const consent = getStoredConsent();
      if (consent === 'pending') {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        if (consent === 'granted') {
          initAnalyticsIfConsented();
        }
      }
    };

    syncConsentState();

    // Sincroniza em tempo real caso o usuário salve preferências no modal de privacidade
    window.addEventListener(CONSENT_EVENT_NAME, syncConsentState);
    window.addEventListener('storage', syncConsentState);

    return () => {
      window.removeEventListener(CONSENT_EVENT_NAME, syncConsentState);
      window.removeEventListener('storage', syncConsentState);
    };
  }, []);

  const handleAccept = () => {
    saveCookiePreferences({
      analytics: true,
      marketing: true,
    });
    setIsVisible(false);
    initAnalyticsIfConsented();
  };

  const handleDecline = () => {
    saveCookiePreferences({
      analytics: false,
      marketing: false,
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Consentimento de cookies e privacidade"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5 bg-[#171717]/95 backdrop-blur-md border-t border-[#2C2C2C] shadow-2xl animate-in slide-in-from-bottom duration-200"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3 text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
          <Shield className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Utilizamos cookies essenciais para o funcionamento seguro do site e cookies opcionais para métricas de tráfego e melhoria contínua, de acordo com a nossa{' '}
            <button
              type="button"
              onClick={onOpenCookiesPolicyModal || onOpenPrivacyModal}
              className="text-[#F97316] underline hover:text-[#EA580C] focus-visible:outline-2 focus-visible:outline-[#F97316]"
            >
              Política de Cookies
            </button>{' '}
            e a{' '}
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              className="text-[#F97316] underline hover:text-[#EA580C] focus-visible:outline-2 focus-visible:outline-[#F97316]"
            >
              Política de Privacidade
            </button>
            . Você pode aceitar, recusar os opcionais ou personalizar suas preferências.
          </p>
        </div>

        {/* Botões com opções claras */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenCookieSettingsModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#383838] bg-[#1E1E1E] hover:bg-[#282828] text-[#F5F5F5] font-medium text-xs transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
          >
            <Settings className="w-3.5 h-3.5 text-[#A3A3A3]" aria-hidden="true" />
            <span>Configurar cookies</span>
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg border border-[#383838] bg-[#222222] hover:bg-[#2A2A2A] text-[#F5F5F5] font-semibold text-xs tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
          >
            Recusar opcionais
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg border border-[#F97316] bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] font-bold text-xs tracking-wide transition-colors shadow-md focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </aside>
  );
};
