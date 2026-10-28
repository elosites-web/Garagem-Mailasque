import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { businessData, buildWhatsAppUrl } from '../data/business';
import { trackEvent } from '../utils/analytics';

interface HeaderProps {
  onOpenQuoteModal?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('inicio');

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Monitora a seção ativa com base na rolagem
  useEffect(() => {
    const sectionIds = [
      'inicio',
      'servicos',
      'antes-e-depois',
      'seguradoras',
      'como-funciona',
      'galeria',
      'avaliacoes',
      'condicoes',
      'parceria-apvs',
      'orcamento',
      'faq',
      'localizacao',
      'contato',
    ];

    let ticking = false;
    const handleScrollSpy = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
            setActiveSection('localizacao');
            ticking = false;
            return;
          }

          const scrollPosition = window.scrollY + 130;
          let current = 'inicio';

          for (const id of sectionIds) {
            const el = document.getElementById(id);
            if (el) {
              const top = el.offsetTop;
              if (scrollPosition >= top) {
                current = id;
              }
            }
          }
          setActiveSection(current);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  // Suporte a âncora inicial na URL (deep-linking) e evento hashchange
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash;
      if (hash) {
        const targetId = hash.replace('#', '');
        if (targetId === 'inicio' || targetId === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setActiveSection('inicio');
        } else {
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(targetId);
          }
        }
      }
    };

    // Pequeno atraso para aguardar montagem completa do DOM
    const timer = setTimeout(handleHashNavigation, 150);
    window.addEventListener('hashchange', handleHashNavigation);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHashNavigation);
    };
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
    { id: 'servicos', label: 'Serviços', href: '#servicos' },
    { id: 'seguradoras', label: 'Seguradoras', href: '#seguradoras' },
    { id: 'como-funciona', label: 'Como Funciona', href: '#como-funciona' },
    { id: 'galeria', label: 'Galeria', href: '#galeria' },
    { id: 'avaliacoes', label: 'Avaliações', href: '#avaliacoes' },
    { id: 'condicoes', label: 'Condições', href: '#condicoes' },
    { id: 'localizacao', label: 'Localização', href: '#localizacao' },
  ];

  const mobileNavLinks = [
    { id: 'inicio', label: 'Início', href: '#inicio' },
    { id: 'servicos', label: 'Serviços Especializados', href: '#servicos' },
    { id: 'seguradoras', label: 'Seguradoras & Sinistro', href: '#seguradoras' },
    { id: 'como-funciona', label: 'Como Funciona', href: '#como-funciona' },
    { id: 'galeria', label: 'Galeria da Oficina', href: '#galeria' },
    { id: 'avaliacoes', label: 'Avaliações Google (4,9)', href: '#avaliacoes' },
    { id: 'condicoes', label: 'Condições de Pagamento', href: '#condicoes' },
    { id: 'parceria-apvs', label: 'Parceria APVS Brasil', href: '#parceria-apvs' },
    { id: 'orcamento', label: 'Pedir Orçamento', href: '#orcamento' },
    { id: 'faq', label: 'Perguntas Frequentes', href: '#faq' },
    { id: 'localizacao', label: 'Onde Estamos (Mapa)', href: '#localizacao' },
    { id: 'contato', label: 'Contato & Informações', href: '#contato' },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      if (targetId === '' || targetId === 'inicio' || targetId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', window.location.pathname);
        setActiveSection('inicio');
      } else {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', href);
          setActiveSection(targetId);
        }
      }
      setIsMobileMenuOpen(false);
    }
  };

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', { section: 'header' });
  };

  return (
    <>
      {/* Link de acessibilidade: Pular para o conteúdo principal */}
      <a
        href="#conteudo-principal"
        onClick={(e) => handleAnchorClick(e, '#conteudo-principal')}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#F97316] focus:text-[#0A0A0A] focus:font-bold focus:rounded-md focus:shadow-lg"
      >
        Pular para o conteúdo principal
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'header-glass-gradient-scrolled' : 'header-glass-gradient'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          {/* Zona 1: Logo Wordmark (Elemento único, sem tags adicionais) */}
          <a
            href="#inicio"
            onClick={(e) => handleAnchorClick(e, '#inicio')}
            className="flex items-center gap-3 shrink-0 focus-visible:outline-2 focus-visible:outline-[#F97316] rounded-md transition-transform hover:scale-[1.02]"
            aria-label="Garagem Mailasque - Ir para o topo"
          >
            <img
              src="/assets/garagemailasque/logo-garagem-mailasque.png"
              alt="Logotipo Garagem Mailasque"
              className="h-12 w-auto object-contain drop-shadow"
              width={160}
              height={48}
            />
          </a>

          {/* Zona 2: Links de navegação em linha única com indicação ativa */}
          <nav
            className="hidden lg:flex items-center gap-6 text-sm font-medium"
            aria-label="Navegação principal"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`whitespace-nowrap shrink-0 transition-colors duration-150 relative py-1 focus-visible:outline-2 focus-visible:outline-[#F97316] rounded-sm ${
                    isActive
                      ? 'text-[#F97316] font-bold drop-shadow-sm'
                      : 'text-[#E5E5E5] hover:text-white font-medium drop-shadow-sm'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#F97316] to-[#CBD5E1] rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                      aria-hidden="true"
                    />
                  )}
                </a>
              );
            })}
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
              <WhatsAppIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Pedir orçamento</span>
            </a>
          </div>

          {/* Botão de Menu Mobile */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-lg text-[#F5F5F5] hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
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

        {/* Linha de borda inferior em degradê laranja e prateado */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#F97316] via-[#CBD5E1] to-[#E2E8F0] opacity-75 pointer-events-none"
          aria-hidden="true"
        />
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
                {mobileNavLinks.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleAnchorClick(e, link.href)}
                      aria-current={isActive ? 'location' : undefined}
                      className={`px-4 py-3 rounded-lg text-base transition-colors flex items-center justify-between ${
                        isActive
                          ? 'bg-[#222222] text-[#F97316] font-bold border-l-4 border-[#F97316]'
                          : 'text-[#F5F5F5] hover:bg-[#222222] hover:text-[#F97316] font-medium'
                      }`}
                    >
                      <span>{link.label}</span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#F97316]" aria-hidden="true" />
                      )}
                    </a>
                  );
                })}
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
                <WhatsAppIcon className="w-5 h-5 shrink-0" aria-hidden="true" />
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
