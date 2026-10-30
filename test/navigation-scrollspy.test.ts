import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  detectActiveSection,
  SECTION_MAP,
  CANONICAL_SECTIONS,
  SectionRect,
} from '../src/components/Header';

describe('Navigation & Scrollspy Precision Suite', () => {
  const headerHeight = 80;
  const viewportHeight = 800;
  const documentHeight = 6000;

  // Mock de seções empilhadas verticalmente
  const makeMockSections = (activeId: string) => {
    let currentY = 0;
    const heights: Record<string, number> = {
      inicio: 700,
      servicos: 600,
      'antes-e-depois': 500,
      seguradoras: 450,
      'como-funciona': 500,
      galeria: 650,
      avaliacoes: 550,
      condicoes: 500,
      'parceria-apvs': 450,
      orcamento: 600,
      faq: 500,
      localizacao: 550,
      contato: 400,
    };

    let totalHeight = 0;
    for (const id of CANONICAL_SECTIONS) {
      totalHeight += heights[id] || 500;
    }

    // Encontra o offset do activeId no mock
    let activeTop = 0;
    for (const id of CANONICAL_SECTIONS) {
      if (id === activeId) {
        break;
      }
      activeTop += heights[id] || 500;
    }

    // Calcula os rects em relação ao viewport assumindo que o scroll rolou até activeTop
    const scrollOffset = activeTop;
    const rects: SectionRect[] = [];

    for (const id of CANONICAL_SECTIONS) {
      const h = heights[id] || 500;
      const top = currentY - scrollOffset;
      const bottom = top + h;
      rects.push({ id, top, bottom, height: h });
      currentY += h;
    }

    return { rects, activeTop, totalHeight };
  };

  it('1. Detects "inicio" when scroll position is at the very top (scrollY <= 50)', () => {
    const { rects, totalHeight } = makeMockSections('inicio');
    const result = detectActiveSection({
      scrollY: 0,
      viewportHeight,
      documentHeight: totalHeight,
      headerHeight,
      sectionRects: rects,
    });
    assert.strictEqual(result, 'inicio');
  });

  it('2. Detects "como-funciona" accurately after smooth scrolling or navigation', () => {
    const { rects, activeTop, totalHeight } = makeMockSections('como-funciona');
    const result = detectActiveSection({
      scrollY: activeTop,
      viewportHeight,
      documentHeight: totalHeight,
      headerHeight,
      sectionRects: rects,
    });
    assert.strictEqual(result, 'como-funciona');
  });

  it('3. Detects "galeria" accurately', () => {
    const { rects, activeTop, totalHeight } = makeMockSections('galeria');
    const result = detectActiveSection({
      scrollY: activeTop,
      viewportHeight,
      documentHeight: totalHeight,
      headerHeight,
      sectionRects: rects,
    });
    assert.strictEqual(result, 'galeria');
  });

  it('4. Detects "avaliacoes" (Google Reviews 4.9)', () => {
    const { rects, activeTop, totalHeight } = makeMockSections('avaliacoes');
    const result = detectActiveSection({
      scrollY: activeTop,
      viewportHeight,
      documentHeight: totalHeight,
      headerHeight,
      sectionRects: rects,
    });
    assert.strictEqual(result, 'avaliacoes');
  });

  it('5. Detects "condicoes" (Condições de Pagamento / Simulador)', () => {
    const { rects, activeTop, totalHeight } = makeMockSections('condicoes');
    const result = detectActiveSection({
      scrollY: activeTop,
      viewportHeight,
      documentHeight: totalHeight,
      headerHeight,
      sectionRects: rects,
    });
    assert.strictEqual(result, 'condicoes');
  });

  it('6. Detects "parceria-apvs"', () => {
    const { rects, activeTop, totalHeight } = makeMockSections('parceria-apvs');
    const result = detectActiveSection({
      scrollY: activeTop,
      viewportHeight,
      documentHeight: totalHeight,
      headerHeight,
      sectionRects: rects,
    });
    assert.strictEqual(result, 'parceria-apvs');
  });

  it('7. Detects "orcamento" (Formulário de Cotação)', () => {
    const { rects, activeTop, totalHeight } = makeMockSections('orcamento');
    const result = detectActiveSection({
      scrollY: activeTop,
      viewportHeight,
      documentHeight: totalHeight,
      headerHeight,
      sectionRects: rects,
    });
    assert.strictEqual(result, 'orcamento');
  });

  it('8. Detects "faq" (Perguntas Frequentes)', () => {
    const { rects, activeTop, totalHeight } = makeMockSections('faq');
    const result = detectActiveSection({
      scrollY: activeTop,
      viewportHeight,
      documentHeight: totalHeight,
      headerHeight,
      sectionRects: rects,
    });
    assert.strictEqual(result, 'faq');
  });

  it('9. Detects "localizacao" (Onde Estamos / Mapa)', () => {
    const { rects, activeTop, totalHeight } = makeMockSections('localizacao');
    const result = detectActiveSection({
      scrollY: activeTop,
      viewportHeight,
      documentHeight: totalHeight,
      headerHeight,
      sectionRects: rects,
    });
    assert.strictEqual(result, 'localizacao');
  });

  it('10. Detects "contato" (Rodapé) when reaching page bottom without arbitrarily forcing "localizacao"', () => {
    // Quando o usuário rola até o final do documento (documentHeight - viewportHeight = 5200)
    const rects: SectionRect[] = [
      { id: 'localizacao', top: -300, bottom: 250, height: 550 },
      { id: 'contato', top: 250, bottom: 750, height: 500 },
    ];

    const result = detectActiveSection({
      scrollY: 5200,
      viewportHeight: 800,
      documentHeight: 6000,
      headerHeight: 80,
      sectionRects: rects,
    });

    assert.strictEqual(
      result,
      'contato',
      'Must detect "contato" when footer is visible at page bottom instead of forcing "localizacao"'
    );
  });

  it('11. Maps "antes-e-depois" slider under services to "servicos"', () => {
    const { rects, activeTop, totalHeight } = makeMockSections('antes-e-depois');
    const result = detectActiveSection({
      scrollY: activeTop,
      viewportHeight,
      documentHeight: totalHeight,
      headerHeight,
      sectionRects: rects,
    });
    assert.strictEqual(
      result,
      'servicos',
      '"antes-e-depois" is part of the services showcase and must map to "servicos"'
    );
  });

  it('12. Resolves all secondary anchor aliases via SECTION_MAP', () => {
    assert.strictEqual(SECTION_MAP.hero, 'inicio');
    assert.strictEqual(SECTION_MAP['servicos-oficina'], 'servicos');
    assert.strictEqual(SECTION_MAP['antes-e-depois'], 'servicos');
    assert.strictEqual(SECTION_MAP.sinistro, 'seguradoras');
    assert.strictEqual(SECTION_MAP.processo, 'como-funciona');
    assert.strictEqual(SECTION_MAP.fotos, 'galeria');
    assert.strictEqual(SECTION_MAP.depoimentos, 'avaliacoes');
    assert.strictEqual(SECTION_MAP['condicoes-pagamento'], 'condicoes');
    assert.strictEqual(SECTION_MAP.pagamento, 'condicoes');
    assert.strictEqual(SECTION_MAP.apvs, 'parceria-apvs');
    assert.strictEqual(SECTION_MAP.cotacao, 'orcamento');
    assert.strictEqual(SECTION_MAP.duvidas, 'faq');
    assert.strictEqual(SECTION_MAP['onde-estamos'], 'localizacao');
    assert.strictEqual(SECTION_MAP.mapa, 'localizacao');
    assert.strictEqual(SECTION_MAP.rodape, 'contato');
  });

  it('13. Canonical sections list covers all 13 sections in DOM order', () => {
    const expected = [
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
    assert.deepStrictEqual(Array.from(CANONICAL_SECTIONS), expected);
  });
});
