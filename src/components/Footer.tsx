import React from 'react';
import { Instagram, Facebook, MapPin, MessageSquare, Star, ArrowUp, Clock } from 'lucide-react';
import { businessData, buildWhatsAppUrl } from '../data/business';
import { trackEvent } from '../utils/analytics';

interface FooterProps {
  onOpenPrivacyModal?: () => void;
  onOpenTermsModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacyModal, onOpenTermsModal }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#2C2C2C] text-[#A3A3A3] text-sm pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          {/* Coluna 1: Marca & Síntese (4 cols) */}
          <div className="lg:col-span-4">
            <a href="#" className="inline-block mb-4 focus-visible:outline-2 focus-visible:outline-[#F97316]">
              <img
                src="/assets/garagemailasque/logo-garagem-mailasque.png"
                alt="Garagem Mailasque"
                width={160}
                height={50}
                className="h-12 w-auto object-contain"
              />
            </a>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed mb-4">
              {businessData.tagline}
            </p>
            <p className="text-xs text-[#737373]">
              CNPJ: {businessData.cnpj}
            </p>
          </div>

          {/* Coluna 2: Navegação Rápida (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] mb-4">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#servicos" className="hover:text-[#F97316] transition-colors">Serviços Especializados</a>
              </li>
              <li>
                <a href="#seguradoras" className="hover:text-[#F97316] transition-colors">Atendimento Seguradoras</a>
              </li>
              <li>
                <a href="#como-funciona" className="hover:text-[#F97316] transition-colors">Como Funciona</a>
              </li>
              <li>
                <a href="#galeria" className="hover:text-[#F97316] transition-colors">Fotos e Vídeos Reais</a>
              </li>
              <li>
                <a href="#avaliacoes" className="hover:text-[#F97316] transition-colors">Avaliações do Google (4,9)</a>
              </li>
              <li>
                <a href="#condicoes" className="hover:text-[#F97316] transition-colors">Condições de Pagamento</a>
              </li>
              <li>
                <a href="#localizacao" className="hover:text-[#F97316] transition-colors">Onde Estamos (Mapa)</a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Contato & Redes (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] mb-4">
              Contato & Redes
            </h4>
            <div className="space-y-3 text-xs sm:text-sm mb-6">
              <a
                href={buildWhatsAppUrl({ originSection: 'site-footer' })}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', { section: 'footer' })}
                className="flex items-center gap-2 hover:text-[#25D366] transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366]" aria-hidden="true" />
                <span>WhatsApp: {businessData.phone}</span>
              </a>

              <a
                href={businessData.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#F97316] transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
                <span>Instagram: {businessData.social.instagramHandle}</span>
              </a>

              <a
                href={businessData.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#3B82F6] transition-colors"
              >
                <Facebook className="w-4 h-4 text-[#3B82F6]" aria-hidden="true" />
                <span>Facebook Oficial</span>
              </a>

              <a
                href={businessData.social.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#F59E0B] transition-colors"
              >
                <Star className="w-4 h-4 text-[#F59E0B] fill-current" aria-hidden="true" />
                <span>Avalie-nos no Google</span>
              </a>
            </div>
          </div>

          {/* Coluna 4: Endereço & Horário Resumido (2 cols) */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] mb-3">
                Localização
              </h4>
              <p className="text-xs text-[#A3A3A3] leading-relaxed mb-4">
                {businessData.address.street}, {businessData.address.neighborhood}, {businessData.address.district} — {businessData.address.city}/{businessData.address.state}
              </p>

              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
                <span>Horário</span>
              </h4>
              <p className="text-xs text-[#A3A3A3] leading-relaxed mb-2">
                {businessData.scheduleSummary}
              </p>
              <p className="text-[11px] text-[#737373]">
                {businessData.holidayNote}
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-xs text-[#A3A3A3] hover:text-[#F97316] transition-colors pt-4 focus-visible:outline-2 focus-visible:outline-[#F97316]"
            >
              <ArrowUp className="w-4 h-4" aria-hidden="true" />
              <span>Voltar ao topo</span>
            </button>
          </div>
        </div>

        {/* Linha Divisória */}
        <div className="pt-8 border-t border-[#2C2C2C] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#737373]">
          {/* Declaração de responsabilidade e controladoria de dados LGPD */}
          <div className="text-center md:text-left">
            <p>© {new Date().getFullYear()} {businessData.name}. Todos os direitos reservados.</p>
            <p className="mt-1 text-[#525252]">{businessData.credits.controllerNotice}</p>
          </div>

          {/* Links de Políticas Legais e Créditos */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              className="hover:text-[#C9CDD2] underline transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
            >
              Política de Privacidade
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={onOpenTermsModal}
              className="hover:text-[#C9CDD2] underline transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
            >
              Termos de Uso
            </button>
            <span aria-hidden="true">·</span>
            <span className="text-[#A3A3A3] font-medium">
              {businessData.credits.developerName}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
