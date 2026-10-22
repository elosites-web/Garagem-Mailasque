import React, { useState, useEffect } from 'react';
import { Menu, X, MessageSquare } from 'lucide-react';
import { businessData, buildWhatsAppUrl } from '../data/business';
import { trackEvent } from '../utils/analytics';

interface HeaderProps {
  onOpenQuoteModal?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fecha o menu com a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Trava scroll quando menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { label: 'Serviços', href: '#servicos' },
    { label: 'Seguradoras', href: '#seguradoras' },
    { label: 'Como Funciona', href: '#como-funciona' },
    { label: 'Galeria', href: '#galeria' },
    { label: 'Avaliações', href: '#avaliacoes' },
    { label: 'Condições', href: '#condicoes' },
    { label: 'Localização', href: '#localizacao' },
  ];

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', { section: 'header' });
  };

  return (
    <>
      {/* Link de acessibilidade: Pular para o conteúdo principal */}
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#F97316] focus:text-[#0A0A0A] focus:font-bold focus:rounded-md focus:shadow-lg"
      >
        Pular para o conteúdo principal
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 ${
          isScrolled
            ? 'bg-[#0E0E0E]/95 backdrop-blur-md border-b border-[#2C2C2C] shadow-lg'
            : 'bg-[#0E0E0E]/80 backdrop-blur-sm border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          {/* Zona 1: Logo Wordmark (Elemento único, sem tags adicionais) */}
          <a
            href="#"
            className="flex items-center gap-3 shrink-0 focus-visible:outline-2 focus-visible:outline-[#F97316] rounded-md"
            aria-label="Garagem Mailasque - Página inicial"
          >
            <img
              src="/assets/garagemailasque/logo-garagem-mailasque.png"
              alt="Logotipo Garagem Mailasque"
              className="h-12 w-auto object-contain"
              width={160}
              height={48}
            />
          </a>

          {/* Zona 2: Links de navegação em linha única */}
          <nav
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#A3A3A3]"
            aria-label="Navegação principal"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap shrink-0 hover:text-[#F5F5F5] transition-colors duration-150 relative py-1 focus-visible:outline-2 focus-visible:outline-[#F97316] rounded-sm"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zona 3: Ação primária única */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <a
              href={buildWhatsAppUrl({ originSection: 'site-header' })}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] font-bold text-sm tracking-wide transition-colors duration-150 shadow-md whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F97316]"
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              <span>Pedir orçamento</span>
            </a>
          </div>

          {/* Botão de Menu Mobile */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-lg text-[#F5F5F5] hover:bg-[#1F1F1F] transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu-drawer"
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Mobile Acessível */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          className="fixed inset-0 z-50 lg:hidden"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-[#171717] border-l border-[#2C2C2C] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#2C2C2C]">
                <img
                  src="/assets/garagemailasque/logo-garagem-mailasque.png"
                  alt="Garagem Mailasque"
                  className="h-10 w-auto object-contain"
                  width={130}
                  height={40}
                />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#222222] transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
                  aria-label="Fechar menu"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col gap-2" aria-label="Navegação móvel">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-base font-medium text-[#F5F5F5] hover:bg-[#222222] hover:text-[#F97316] transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-[#2C2C2C] flex flex-col gap-3">
              <a
                href={buildWhatsAppUrl({ originSection: 'site-drawer-mobile' })}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  handleWhatsAppClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-[#F97316] text-[#0A0A0A] font-bold text-base shadow-lg hover:bg-[#EA580C] transition-colors"
              >
                <MessageSquare className="w-5 h-5" aria-hidden="true" />
                <span>Pedir orçamento no WhatsApp</span>
              </a>

              <p className="text-xs text-center text-[#737373]">
                {businessData.address.neighborhood}, {businessData.address.district} - {businessData.address.city}/SP
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
