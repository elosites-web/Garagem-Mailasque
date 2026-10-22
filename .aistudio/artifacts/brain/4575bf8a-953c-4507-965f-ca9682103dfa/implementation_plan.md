# Reestruturação da Seção Galeria — Carrossel Horizontal Compacto

Transformação da seção de Galeria da Garagem Mailasque de uma grade vertical extensa para uma faixa horizontal única e fluida com CSS scroll-snap, ocupando no máximo ~1 viewport, com controles acessíveis de navegação por toque, teclado e botões, além de slide unificado para fotos da equipe e lightbox responsivo.

## User Review & Critical Decisions

> [!IMPORTANT]
> Decisões confirmadas com o usuário durante o alinhamento da Fase 1:

- **Comportamento do Lightbox para a Equipe**: Ao clicar no slide da equipe, o Lightbox exibirá as duas fotos lado a lado no próprio visualizador modal, preservando a composição conjunta com legenda unificada.
- **Legenda do Slide de Equipe**: A legenda única definida para o slide no carrossel e no lightbox é **"Equipe Garagem Mailasque"**.
- **Proporção e Altura Sem Distorção**: Todos os slides adotarão altura padronizada (`h-[240px] sm:h-[300px] lg:h-[360px]`) e largura automática baseada na proporção nativa dos arquivos (`aspect-ratio: width / height`), assegurando visualização sem cortes de fotos horizontais, verticais e vídeos 9:16.
- **Substituição de Ativos e Metatags**: Remoção definitiva de qualquer referência a `card-apresentacao.jpg` e confirmação dos posters reais dos 6 vídeos e de `og-image.jpg`.

---

## 1. Overview & Core Concept

- **O que faz**: Compacta a galeria da oficina em uma faixa horizontal com scroll lateral (`scroll-snap-type: x mandatory`), reduzindo o consumo vertical da página e permitindo que o visitante explore toda a infraestrutura física e filmagens técnicas sem rolagem interminável.
- **Público-alvo**: Clientes locais em busca de serviços de funilaria, pintura automotiva e reparos por seguradoras em Mailasqui e São Roque/SP, que valorizam transparência visual sobre a infraestrutura e os profissionais.
- **Valor gerado**: Aumento significativo na retenção e no engajamento visual na página (seção enxuta que cabe em ~1 tela), proporcionando uma experiência refinada tanto no desktop quanto no toque em dispositivos móveis.

---

## 2. User Experience & Visual Design

### A. Fluxo de Navegação do Carrossel
1. **Entrada na Seção**: O usuário visualiza o cabeçalho conciso (*"Nossa Oficina"* / *"Estrutura real, processos técnicos e equipe dedicada"* / *"Fotos e vídeos reais da oficina, da equipe e do nosso trabalho em Mailasqui."*) com espaçamento otimizado (`py-12 md:py-16`).
2. **Filtros por Categoria**: Botões compactos (*Todos (10)*, *Fotos (4)*, *Vídeos (6)*) com `text-[11px]` e bordas sutis. Ao alternar, o carrossel retorna suavemente para o início (`scrollLeft = 0`).
3. **Exploração dos Slides**:
   - **Scroll-snap Nativo**: Rolagem horizontal suave no desktop e no mobile por gestos de arrasto ou toque.
   - **Setas Sobrepostas**: Círculos de 44×44px em `#F97316` com ícones pretos nas extremidades, com desativação automática (`disabled`, opacidade reduzida) nos limites de início e fim.
   - **Fade Lateral Sutil**: Efeito de fade nas bordas esquerda e direita (`from-[#0E0E0E] to-transparent`, `pointer-events-none`) para sinalizar continuidade de conteúdo.
4. **Slide Especial de Equipe**:
   - As fotos `equipe1.jpeg` (1254×787) e `equipe2.jpeg` (828×500) aparecem no mesmo card lado a lado, com `gap-2` e mesma altura, sem distorção e com legenda única.
5. **Abertura do Lightbox**:
   - Ao clicar ou teclar `Enter`/`Espaço` em qualquer item, abre-se o Lightbox Modal focado na mídia correspondente, com suporte a teclado (`Escape`, `ArrowLeft`, `ArrowRight`, focus trap).

### B. Indicador de Progresso & Acessibilidade
- Trilho fino (`h-1`, fundo `#2C2C2C`, barra de preenchimento `#F97316`) posicionado abaixo do carrossel refletindo a proporção de `scrollLeft`.
- Texto discreto *"Deslize para ver mais"*, que desaparece após a primeira rolagem no desktop.
- Marcações semânticas completas: `role="region"`, `aria-roledescription="carousel"`, `aria-label="Galeria de fotos e vídeos da Garagem Mailasque"`, slides com `role="group"` e `aria-roledescription="slide"`.
- Suporte a `prefers-reduced-motion` no scroll suave (`behavior: 'auto'` quando reduzido).

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1: CSS Scroll-Snap nativo em vez de biblioteca externa (ex: Swiper, Embla)**
  - *Abordagem*: Implementação pura em CSS e React com `snap-x snap-mandatory`, botões com `scrollBy` e cálculo de progresso via listener de `scroll`.
  - *Por que*: Economiza mais de 40 kB de bundle JS, garante performance de 60fps no hardware mobile e evita conflitos com re-renderizações e hidratação.
- **Decisão 2: Slide composto de equipe no data model (`GalleryTeamItem`)**
  - *Abordagem*: Criar tipagem discriminada que suporte o item composto da equipe com duas imagens (`photos: [equipe1, equipe2]`) mantendo itens simples (`GalleryPhoto` e `GalleryVideo`) para as demais mídias.
  - *Por que*: Permite que os filtros de categoria calculem a contagem correta de itens e o Lightbox renderize ambas lado a lado com precisão sem hacky CSS.
- **Decisão 3: Manutenção da proporção real (`aspect-ratio`) via inline style**
  - *Abordagem*: Cada slide fixa `h-full` ou `h-[240px] sm:h-[300px] lg:h-[360px]` e calcula a largura através de `aspectRatio: width / height`.
  - *Por que*: Evita faixas pretas e recortes indesejados nas fotos horizontais (1254×787, 925×583), fotos quadradas (1027×1011) e vídeos verticais (576×768).

---

## 4. Technical Architecture & Data Strategy

### Component Hierarchy & Interaction Flow

```
┌────────────────────────────────────────────────────────┐
│                      Gallery.tsx                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Header (py-12 md:py-16, texto enxuto)          │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Filter Bar: Todos (10) | Fotos (4) | Vídeos (6)│  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Carousel Track Container            │  │
│  │  ┌──────────┐ ┌──────────────────────────────┐   │  │
│  │  │ Prev Btn │ │ Flex Track (overflow-x-auto) │   │  │
│  │  │ (44x44px)│ │                              │   │  │
│  │  └──────────┘ │  ┌─────────┐ ┌────────────┐  │   │  │
│  │               │  │ Slide 1 │ │ Slide 2    │  │   │  │
│  │               │  │ (Câmara)│ │ (Equipe 1+2)│  │   │  │
│  │               │  └─────────┘ └────────────┘  │   │  │
│  │               │                              │   │  │
│  │               │  ┌─────────┐ ┌────────────┐  │   │  │
│  │               │  │ Slide 3 │ │ Slide 4..  │  │   │  │
│  │               │  │ (Vídeo) │ │ (Recepção) │  │   │  │
│  │               │  └─────────┘ └────────────┘  │   │  │
│  │               └──────────────────────────────┘   │  │
│  │                                     ┌──────────┐ │  │
│  │  [Fade Left]           [Fade Right] │ Next Btn │ │  │
│  │                                     │ (44x44px)│ │  │
│  │                                     └──────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Position Indicator: Progress Bar + Hint Text   │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
                           │ Click / Enter / Space
                           ▼
┌────────────────────────────────────────────────────────┐
│                   LightboxModal.tsx                    │
│  - Suporte a item simples (Imagem/Vídeo)               │
│  - Suporte a item de Equipe (2 fotos lado a lado)      │
│  - Controles de navegação, Escape e Focus Trap         │
└────────────────────────────────────────────────────────┘
```

### Arquivos e Modificações Previstas

1. **`src/data/gallery.ts`**:
   - Definição da interface `GalleryTeamItem` com `photos: GalleryPhoto[]` (equipe1 e equipe2).
   - Atualização do tipo `GalleryItem = GalleryPhoto | GalleryVideo | GalleryTeamItem`.
   - Remoção de qualquer menção a `card-apresentacao`.
   - Garantia de que os 6 vídeos apontem para seus respectivos posters em `/assets/garagemailasque/posters/`.
2. **`src/components/Gallery.tsx`**:
   - Reestruturação do layout com faixa horizontal `overflow-x-auto snap-x snap-mandatory`.
   - Implementação de botões de navegação lateral (`ChevronLeft`, `ChevronRight`) com verificação de limites em tempo real.
   - Cálculo dinâmico do indicador de progresso via proporção `scrollLeft / (scrollWidth - clientWidth)`.
   - Renderização especializada do slide da equipe (composição lado a lado das fotos 1 e 2).
   - Suporte completo a navegação por teclado (ao focar um slide, rola até o campo visual).
3. **`src/components/LightboxModal.tsx`**:
   - Adição de suporte ao `GalleryTeamItem` para renderizar as duas fotos da equipe lado a lado em tela cheia com proporções preservadas.
4. **`index.html`**:
   - Verificação e garantia de que `og:image`, `twitter:image` e JSON-LD apontem unicamente para `https://www.garagemmailasque.com.br/assets/garagemailasque/og-image.jpg`.
