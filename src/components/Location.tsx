import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Accessibility,
  ExternalLink,
  Clock,
  Copy,
  Check,
  Compass,
  Milestone,
} from 'lucide-react';
import { businessData, getCurrentDayOfWeekSaoPaulo } from '../data/business';
import { trackEvent } from '../utils/analytics';

export const Location: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const currentDayOfWeek = getCurrentDayOfWeekSaoPaulo();

  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setShouldLoadMap(true);
            observer.disconnect();
          }
        },
        { rootMargin: '450px' }
      );
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      setShouldLoadMap(true);
    }
  }, []);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(businessData.address.fullFormatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectionsGeoClick = () => {
    trackEvent('maps_click', { section: 'location-geo-scheme' });
  };

  const handleGoogleMapsDirectionsClick = () => {
    trackEvent('maps_click', { section: 'location-google-maps-directions' });
  };

  const handleWazeClick = () => {
    trackEvent('maps_click', { section: 'location-waze-directions' });
  };

  const handleProfileClick = () => {
    trackEvent('maps_click', { section: 'location-google-profile' });
  };

  return (
    <section
      id="localizacao"
      aria-labelledby="location-title"
      className="py-20 md:py-28 bg-[#0E0E0E] border-b border-[#2C2C2C] relative"
    >
      {/* Âncoras alternativas para navegação semântica */}
      <div id="onde-estamos" className="sr-only" aria-hidden="true" />
      <div id="mapa" className="sr-only" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-3 block">
            Onde Estamos
          </span>
          <h2
            id="location-title"
            className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase text-[#F5F5F5] tracking-tight mb-4"
          >
            Fácil acesso na Rodovia Raposo Tavares
          </h2>
          <p className="text-base text-[#A3A3A3] leading-relaxed">
            Localização estratégica em Mailasqui para atender clientes de São Roque, Mairinque, Alumínio, Sorocaba e região com conveniência e segurança.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Informações de Endereço, Referências, Tabela e Acessibilidade (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-[#171717] border border-[#2C2C2C] p-6 sm:p-8 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 border border-[#F97316]/30 flex items-center justify-center text-[#F97316]">
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F5]">Endereço Completo</h3>
                  <p className="text-xs text-[#737373]">Pinheirinho · Mailasqui</p>
                </div>
              </div>

              {/* Endereço em Texto */}
              <div className="p-4 rounded-2xl bg-[#121212] border border-[#2C2C2C] mb-5">
                <p className="text-base font-semibold text-[#F5F5F5] leading-snug mb-1">
                  {businessData.address.street}
                </p>
                <p className="text-sm text-[#A3A3A3]">
                  Bairro {businessData.address.neighborhood}, {businessData.address.district}
                </p>
                <p className="text-sm text-[#A3A3A3]">
                  {businessData.address.city}/{businessData.address.state} — CEP {businessData.address.cep}
                </p>

                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#22C55E]" aria-hidden="true" />
                      <span className="text-[#22C55E]">Endereço copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Copiar endereço completo</span>
                    </>
                  )}
                </button>
              </div>

              {/* Breve Descrição de Referência da Rodovia Raposo Tavares */}
              <div className="p-4 rounded-2xl bg-[#121212] border border-[#2C2C2C] mb-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Milestone className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5]">
                    Pontos de Referência na Rodovia
                  </h4>
                </div>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  {businessData.address.referencePoints}
                </p>
              </div>

              {/* Tabela de Horário de Funcionamento (7 dias, texto real, dia atual destacado por texto e peso) */}
              <div className="p-4 rounded-2xl bg-[#121212] border border-[#2C2C2C] mb-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[#2C2C2C]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
                    <h4 className="text-sm font-bold text-[#F5F5F5]">Horário de Funcionamento</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <a
                      href={businessData.social.googleMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleProfileClick}
                      className="inline-flex items-center gap-1.5 font-semibold text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
                      title="Ver perfil e fotos no Google Maps"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#F97316] shrink-0" aria-hidden="true" />
                      <span>Ver no Google Maps</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {businessData.schedule.map((item) => {
                    const isToday = item.dayOfWeek === currentDayOfWeek;
                    return (
                      <div
                        key={item.dayName}
                        className={`flex items-center justify-between py-1 px-2 rounded-md transition-colors ${
                          isToday
                            ? 'bg-[#1F1F1F] font-bold text-[#F5F5F5] border border-[#F97316]/40'
                            : 'text-[#A3A3A3]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{item.dayName}</span>
                          {isToday && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316]">
                              (Hoje)
                            </span>
                          )}
                        </span>
                        <span className={`tabular-nums ${isToday ? 'text-[#F97316] font-bold' : 'text-[#C9CDD2]'}`}>
                          {item.hours}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3 pt-2 border-t border-[#2C2C2C] text-[11px] text-[#737373] text-left">
                  {businessData.holidayNote}
                </p>
              </div>

              {/* Acessibilidade Garantida */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#121212] border border-[#2C2C2C] mb-6">
                <div className="w-9 h-9 rounded-lg bg-[#222222] flex items-center justify-center text-[#22C55E] shrink-0">
                  <Accessibility className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F5F5F5]">Acessibilidade</h4>
                  <p className="text-xs text-[#A3A3A3] mt-0.5">{businessData.accessibility}</p>
                </div>
              </div>
            </div>

            {/* Bloco de Navegação e Ação: Ver no Google Maps & Como Chegar (esquema geo:) */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Botão 1: Ver no Google Maps (Abre em nova aba com rel="noopener noreferrer") */}
                <a
                  href={businessData.social.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleProfileClick}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#1F1F1F] hover:bg-[#282828] text-[#F5F5F5] border border-[#2C2C2C] hover:border-[#C9CDD2]/40 font-bold text-xs sm:text-sm tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
                  title="Abrir perfil da Garagem Mailasque no Google Maps em nova aba"
                >
                  <MapPin className="w-4 h-4 text-[#F97316] shrink-0" aria-hidden="true" />
                  <span>Ver no Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#737373] shrink-0" aria-hidden="true" />
                </a>

                {/* Botão 2: Como Chegar com esquema nativo geo:0,0?q=... */}
                <a
                  href={businessData.navigation.geoScheme}
                  onClick={handleDirectionsGeoClick}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-[#0A0A0A] font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-lg hover:shadow-[#F97316]/20 focus-visible:outline-2 focus-visible:outline-[#F97316]"
                  title="Abrir aplicativo de navegação nativo no dispositivo (GPS)"
                >
                  <Navigation className="w-4 h-4 shrink-0 fill-current" aria-hidden="true" />
                  <span>Como Chegar</span>
                </a>
              </div>

              {/* Opções de navegação dedicadas: Google Maps e Waze */}
              <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-[#A3A3A3] font-medium text-center sm:text-left flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#F97316] shrink-0" aria-hidden="true" />
                  <span>Escolha seu app de navegação:</span>
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={businessData.navigation.googleMapsDirections}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleGoogleMapsDirectionsClick}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-[#F5F5F5] border border-[#333333] hover:border-[#F97316]/50 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#F97316]"
                    title="Navegar com rota no Google Maps"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#F97316] shrink-0" aria-hidden="true" />
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3 text-[#737373]" aria-hidden="true" />
                  </a>

                  <a
                    href={businessData.navigation.waze}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWazeClick}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-[#33CCFF] hover:text-[#55D8FF] border border-[#333333] hover:border-[#33CCFF]/50 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#33CCFF]"
                    title="Iniciar navegação pelo Waze"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#33CCFF] shrink-0 fill-current" aria-hidden="true" />
                    <span>Waze</span>
                    <ExternalLink className="w-3 h-3 opacity-60" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa Incorporado diferido com IntersectionObserver e Badge de Geolocalização (7 cols) */}
          <div
            ref={mapContainerRef}
            className="lg:col-span-7 rounded-3xl overflow-hidden border border-[#2C2C2C] bg-[#171717] shadow-xl min-h-[460px] sm:min-h-[540px] relative flex items-center justify-center"
          >
            {/* Ícone e Badge Flutuante de Geolocalização Ativa sobre o mapa */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0E0E0E]/90 backdrop-blur-md border border-[#F97316]/40 text-[#F5F5F5] shadow-lg">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F97316]" />
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <Compass className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
                  <span className="font-bold text-[#F5F5F5]">Garagem Mailasque</span>
                  <span className="text-[#A3A3A3] hidden sm:inline">
                    · -23.5702156, -47.0743521
                  </span>
                </div>
              </div>
            </div>

            {shouldLoadMap ? (
              <iframe
                title="Localização da Garagem Mailasque no Google Maps"
                src="https://maps.google.com/maps?q=-23.5702156,-47.0743521&hl=pt-BR&z=16&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '100%' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full grayscale-[25%] contrast-110"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-[#737373]">
                <MapPin className="w-8 h-8 text-[#F97316]/60 mb-2 animate-pulse" aria-hidden="true" />
                <p className="text-xs font-semibold text-[#A3A3A3]">
                  Carregando mapa interativo ao aproximar da tela...
                </p>
                <a
                  href={businessData.social.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 px-4 py-2 rounded-lg bg-[#222222] text-[#F5F5F5] border border-[#333333] text-xs font-semibold hover:border-[#F97316]/50 transition-colors"
                >
                  Abrir no Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
