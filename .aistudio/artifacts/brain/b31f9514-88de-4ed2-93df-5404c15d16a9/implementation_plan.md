# Remodelagem de Design e Implementação de Boas Práticas — Garagem Mailasque

Plano arquitetural e visual para aplicar as diretrizes de UI/UX avançado, tokens de design centralizados, micro-interações fluidas e boas práticas de SEO local no site institucional da Garagem Mailasque, preservando integralmente todos os textos, dados cadastrais e funcionalidades vigentes sem alterações de conteúdo.

## Decisões Confirmadas com o Usuário

> [!IMPORTANT]
> As decisões de direção visual e escopo foram confirmadas previamente na fase de esclarecimento:
> - **Paleta de Tokens de Design**: Mantido o laranja automotivo (`#F97316`) como acento de alta energia sobre fundo obsidiana (`#0E0E0E`) e superfícies em grafite automotivo (`#171717` / `#202020`).
> - **Intensidade das Micro-interações**: Transições suaves e elegantes com *scroll-reveal* (fade-up sutil via IntersectionObserver nativo) e elevação suave com sombra aprimorada nos cards (`translateY(-4px)`).
> - **SEO e Arquivos Técnicos**: Inclusão do script determinístico `scripts/gerar_seo.py` e geração de `public/sitemap.xml` e `public/robots.txt` sincronizados com o domínio oficial.
> - **Preservação de Conteúdo**: Zero alteração em textos, telefones, endereços, serviços, avaliações reais ou fluxos existentes; nenhuma adição de conteúdo inventado.

---

## 1. Visão Geral e Conceito Central

- **O que entrega**: Uma elevação estética completa da interface, transformando o site em uma vitrine digital de alto padrão para funilaria, pintura automotiva em estufa e martelinho de ouro.
- **Público-alvo**: Proprietários de veículos e clientes de seguradoras de São Roque, Mairinque, Ibiúna e região que buscam serviço de precisão artesanal e atendimento confiável.
- **Valor agregado**: Experiência visual refinada, navegação ultrarrápida, tempos de carregamento otimizados, acessibilidade total (WCAG 2.1 AA) e máxima taxa de conversão em contatos via WhatsApp.

---

## 2. Experiência do Usuário e Design Visual

### Direção Estética e Atmosfera
- **Atmosfera Automotiva Premium**: Tons escuros industriais (obsidiana, fibra de carbono e grafite titânio) combinados com o contraste cirúrgico do laranja Mailasque.
- **Hierarquia Tipográfica Refinada**:
  - Títulos de exibição e seções com fonte condensada robusta (`Barlow Condensed` / `Oswald`), conferindo impacto esportivo e mecânico.
  - Textos de leitura e botões com tipografia geométrica moderna (`Plus Jakarta Sans`), garantindo leitura confortável e diâmetro de linha entre 45 e 75 caracteres (`max-w-2xl` e `text-wrap: balance`).
  - Números, prazos e simulações com dígitos tabulares alinhados (`tabular-nums`).
- **Disciplina Anti-Slop e Zero-Pill**:
  - Eliminação de pílulas/chips estáticos em metadados informativos, utilizando texto limpo com separadores tipográficos sutis (`·`).
  - Superfícies com bordas ultrafinas de precisão (`1px solid rgba(255,255,255,0.08)` e acentos metálicos em prata escovada), sem sombras pesadas ou clichês visuais.

### Sistema de Micro-interações e Motion Design
- **Scroll-Reveal Suave**:
  - Observer leve em IntersectionObserver aplicando transição suave de opacidade e translação vertical (`opacity: 1; transform: translateY(0)`) apenas quando a seção entra na área visível.
  - Respeito irrestrito a `prefers-reduced-motion` (desativação automática para usuários com sensibilidade motora/vestibular).
- **Elevação Tátil nos Cards**:
  - Efeito suave ao passar o mouse (`translateY(-4px)` acompanhado de expansão sutil da sombra difusa e realce de borda).
- **Botão Flutuante de WhatsApp e Balão Proativo**:
  - Preservação da levitação fluida do balão e pulso suave em verde com alto contraste, permanecendo dentro do limite de 15% de ocupação na tela mobile.

---

## 3. Decisões Técnicas e Trade-Offs

- **Tokens CSS em `:root` (`src/styles/tokens.css`)**:
  - *Abordagem*: Centralização rigorosa de todas as escalas (cores, tipografia modular, espaçamentos em base 4px, raios de borda e temporizações de animação) em variáveis CSS nativas.
  - *Vantagem*: Manutenção unificada, compatibilidade direta com Tailwind CSS e zero dependências pesadas em tempo de execução.
- **Script SEO Determinístico (`scripts/gerar_seo.py`)**:
  - *Abordagem*: Adição do script Python padrão para geração de `sitemap.xml` e `robots.txt` na pasta `public/`.
  - *Vantagem*: Automação determinística e independente de bibliotecas externas para futuras atualizações de rotas.
- **Preservação de Conteúdo e Dados (`src/data/`)**:
  - *Abordagem*: Separação estrita entre dados comerciais e apresentação visual, mantendo `services.ts`, `cases.ts`, `testimonials.ts` e `company.ts` intocados.

---

## 4. Arquitetura Técnica e Diagrama do Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Design Tokens (:root)                          │
│  --cor-fundo  --cor-superficie  --cor-primaria  --space-*  --radius-*  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ importa
┌───────────────────────────────────▼────────────────────────────────────┐
│                  Estilos Globais (src/index.css)                       │
│      @import "tailwindcss"; @import "./styles/tokens.css";             │
│      Classes de animação, foco acessível e regras WCAG 2.1 AA         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ consome
┌───────────────────────────────────▼────────────────────────────────────┐
│                    Layout da Aplicação (App.tsx)                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Top Bar Header (Marca 1-linha · Navegação · CTA de Orçamento)    │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Main Content (Hero · Serviços · Antes/Depois · Seguradoras ·    │  │
│  │                Galeria · Depoimentos · FAQ · Contato)             │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Footer Institucional (Dados · Mapa · LGPD · Links Google)        │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Elementos Flutuantes (WhatsApp Dinâmico + Consentimento Cookies) │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Roteiro de Execução de Mudanças:
1. **Tokens CSS (`src/styles/tokens.css`)**:
   - Atualizar a especificação completa de tokens alinhada com as diretrizes do arquivo anexo, mantendo a paleta de oficina automotiva (laranja `#F97316` + grafite `#121212` / `#171717`).
2. **Estilos Globais e Animações (`src/index.css`)**:
   - Ajustar utilitários de transição para cards, estados de foco `:focus-visible` em 2px, regras de balanceamento de texto e scroll-reveal suave.
3. **Refinamento dos Componentes (`src/components/`)**:
   - **Header**: Assegurar proporção de 1 linha sem envoltórios pill desnecessários e foco no CTA principal.
   - **Hero, Serviços e Seguradoras**: Ajustar espaçamentos, elevação dos cards ao passar o cursor (`translateY(-4px)`), balanceamento de títulos e hierarquia visual.
   - **Galeria e Antes & Depois**: Manter lazy loading e refinamento das transições visuais com foco na nitidez dos veículos.
   - **Formulários e FAQ**: Garantir contraste de bordas e estados de validação claros.
4. **Script SEO e Arquivos em `public/`**:
   - Criar `scripts/gerar_seo.py` e sincronizar `public/sitemap.xml` e `public/robots.txt`.
5. **Verificação**:
   - Validação com `lint_applet` e `compile_applet`.
