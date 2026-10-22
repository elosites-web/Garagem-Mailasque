import React, { useState, useEffect } from 'react';

/**
 * Barra de progresso de leitura fixa no topo da página.
 * Exibe o gradiente característico da marca com a ponta brilhante em prata
 * e espessura idêntica à da barra para feedback visual contínuo.
 */
export const ScrollProgressBar: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const progress = Math.min(Math.max((scrollY / docHeight) * 100, 0), 100);
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none bg-black/20"
      role="progressbar"
      aria-label="Progresso de leitura da página"
      aria-valuenow={Math.round(scrollProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full relative transition-[width] duration-75 ease-out bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#FB923C]"
        style={{ width: `${scrollProgress}%` }}
      >
        {/* Ponta brilhante em prata com a mesma espessura da barra (h-full) */}
        {scrollProgress > 0 && (
          <span
            className="absolute right-0 top-0 bottom-0 w-3.5 h-full bg-gradient-to-r from-transparent via-[#C9CDD2] to-[#FFFFFF] shadow-[0_0_8px_rgba(255,255,255,0.95),0_0_14px_rgba(201,205,210,0.85)] rounded-r-full pointer-events-none"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};
