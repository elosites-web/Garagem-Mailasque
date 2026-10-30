import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { businessData, buildWhatsAppUrl } from '../data/business';
import { trackEvent, trackWhatsAppConversion } from '../utils/analytics';

interface HeaderProps {
  onOpenQuoteModal?: () => void;
}

export const CANONICAL_SECTIONS = [
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
] as const;

export const SECTION_MAP: Record<string, string> = {
  hero: 'inicio',
  'servicos-oficina': 'servicos',
  'antes-e-depois': 'servicos', // Comparador antes/depois é extensão direta dos serviços
  sinistro: 'seguradoras',
  processo: 'como-funciona',
  fotos: 'galeria',
  depoimentos: 'avaliacoes',
  'condicoes-pagamento': 'condicoes',
  pagamento: 'condicoes',
  apvs: 'parceria-apvs',
  cotacao: 'orcamento',
  duvidas: 'faq',
  'onde-estamos': 'localizacao',
  mapa: 'localizacao',
  rodape: 'contato',
};

export interface SectionRect {
  id: string;
  top: number;
  bottom: number;
  height: number;
}

/**
 * Função pura e determinística para detectar a seção ativa baseada na geometria real do viewport
 */
export function detectActiveSection(params: {
  scrollY: number;
  viewportHeight: number;
  documentHeight: number;
  headerHeight: number;
  sectionRects: SectionRect[];
}): string {
  const { scrollY, viewportHeight, documentHeight, headerHeight, sectionRects } = params;

  // 1. Topo da página: início
  if (scrollY <= 50) {
    return 'inicio';
  }

  // 2. Fim absoluto da página: avalia contato (rodapé) vs localizacao
  const isAtBottom = viewportHeight + scrollY >= documentHeight - 30;
  if (isAtBottom) {
    const contato = sectionRects.find((s) => s.id === 'contato');
    if (contato && contato.top <= viewportHeight * 0.65) {
      return 'contato';
    }
    const localizacao = sectionRects.find((s) => s.id === 'localizacao');
    if (localizacao && localizacao.bottom > headerHeight + 40) {
      return 'localizacao';
    }
  }

  // 3. Linha focal de leitura (logo abaixo do header fixo)
  const readingLine = headerHeight + Math.min(100, (viewportHeight - headerHeight) * 0.25);

  // Procura qual seção intercepta a linha focal de leitura
  for (const s of sectionRects) {
    if (s.top <= readingLine && s.bottom > readingLine) {
      return SECTION_MAP[s.id] || s.id;
    }
  }

  // Fallback: seção com maior área visível no viewport (excluindo header)
  let bestId = 'inicio';
  let maxVisible = -1;

  for (const s of sectionRects) {
    const visibleTop = Math.max(headerHeight, s.top);
    const visibleBottom = Math.min(viewportHeight, s.bottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    if (visibleHeight > maxVisible) {
      maxVisible = visibleHeight;
      bestId = s.id;
    }
  }

  return SECTION_MAP[bestId] || bestId;
}

/**
 * Rola a página até a seção alvo compensando com precisão a altura do cabeçalho fixo
 */
export function scrollToSection(targetId: string, behavior: ScrollBehavior = 'smooth'): void {
  if (typeof window === 'undefined') return;

  if (targetId === '' || targetId === 'inicio' || targetId === 'hero') {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  const targetEl = document.getElementById(targetId);
  if (!targetEl) return;

  const headerEl = document.querySelector('header');
  const headerHeight = headerEl ? headerEl.offsetHeight : 80;
  const rect = targetEl.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  // Margem de respiro de 2px para que o topo do elemento não fique sob a borda do header
  const targetScrollTop = Math.max(0, absoluteTop - headerHeight + 2);

  window.scrollTo({
    top: targetScrollTop,
    behavior,
  });
}

export const Header: React.FC<HeaderProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('inicio');

  // Atualização determinística do scrollspy via getBoundingClientRect (imune a offsetParent)
  const updateScrollSpy = useCallback(() => {
    if (typeof window === 'undefined') return;

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const headerEl = document.querySelector('header');
    const headerHeight = headerEl ? headerEl.offsetHeight : 80;

    const sectionRects: SectionRect[] = [];
    for (const id of CANONICAL_SECTIONS) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        sectionRects.push({ id, top: rect.top, bottom: rect.bottom, height: rect.height });
      }
    }

    const detected = detectActiveSection({
      scrollY,
      viewportHeight,
      documentHeight,
      headerHeight,
      sectionRects,
    });

    setActiveSection((prev) => (prev === detected ? prev : detected));
  }, []);

  // Monitora rolagem e redimensionamento da janela de forma otimizada com requestAnimationFrame
  useEffect(() => {
    let ticking = false;

    const onScrollOrResize = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          updateScrollSpy();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    // Verificação inicial na montagem
    onScrollOrResize();

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [updateScrollSpy]);

  // Suporte a âncora inicial na URL (deep-linking), hashchange e popstate
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash;
      if (hash) {
        const targetId = hash.replace('#', '');
        const canonicalId = SECTION_MAP[targetId] || targetId;
        setActiveSection(canonicalId);
        scrollToSection(targetId);
      } else {
        if (window.scrollY < 100) {
          setActiveSection('inicio');
        }
      }
    };

    const timer = setTimeout(handleHashNavigation, 150);
    window.addEventListener('hashchange', handleHashNavigation);
    window.addEventListener('popstate', handleHashNavigation);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHashNavigation);
      window.removeEventListener('popstate', handleHashNavigation);
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

  // Trava scroll quando menu mobile está aberto e garante destravamento ao fechar/desmontar
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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
      const canonicalId = SECTION_MAP[targetId] || targetId;

      // Se o menu mobile estiver aberto, destrava overflow e fecha gaveta antes da rolagem
      if (isMobileMenuOpen) {
        document.body.style.overflow = '';
        setIsMobileMenuOpen(false);
      }

      // Feedback visual imediato e sincronizado
      setActiveSection(canonicalId);
      window.history.pushState(null, '', href === '#inicio' ? window.location.pathname : href);

      // Rola com precisão compensando o cabeçalho no próximo frame de animação
      requestAnimationFrame(() => {
        scrollToSection(targetId);
      });
    }
  };

  const handleToggleMobileMenu = () => {
    if (!isMobileMenuOpen) {
      // Atualiza o scrollspy imediatamente antes de abrir a gaveta
      updateScrollSpy();
      setIsMobileMenuOpen(true);
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  const handleWhatsAppClick = () => {
    trackWhatsAppConversion('header');
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
              onClick={handleToggleMobileMenu}
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
