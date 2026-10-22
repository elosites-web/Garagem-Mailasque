# Landing Page de Alta Conversão — Garagem Mailasque

Landing page de página única ultra-otimizada para conversão da **Garagem Mailasque**, oficina especializada em funilaria e pintura automotiva localizada em Mailasqui (São Roque/SP). O projeto visa transformar visitantes em solicitações qualificadas de orçamento via WhatsApp com máxima credibilidade, prova social autêntica, simulador financeiro transparente e acessibilidade WCAG 2.1 AA.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões confirmadas e diretrizes fundamentais alinhadas com o cliente:**
> - **Foco de Tráfego**: Foco inicial em busca orgânica e Google Maps, com arquitetura pronta para Google Ads (GA4/GTM) e Meta Ads (Pixel) ativada sob demanda via variáveis de ambiente (`.env`).
> - **Créditos do Rodapé**: Exibição discreta de *"Desenvolvido por ēloSites"* ao lado das informações institucionais e de controladoria LGPD.
> - **Vídeos Reais da Oficina na Galeria**: Grade com cards de pré-visualização e reprodução sob clique em modal lightbox acessível (teclado, foco preso, Esc para fechar, sem autoplay invasivo com som).
> - **Regra de Ouro (Zero Invenção)**: Ausência de dados (como horário numérico) utiliza o marcador `{{TODO_CLIENT}}` em `src/data/` e renderiza o botão "Ver no Google Maps" no lugar; sem promessas inventadas de prazos, anos de experiência ou garantias milagrosas.
> - **Catálogo Exato de Serviços**: Estritamente os 4 serviços autorizados: **Funilaria**, **Pintura**, **Martelinho** e **Revisão preventiva**.

---

## 1. Overview & Core Concept

- **O que a aplicação faz**: Apresenta a oficina mecânica de funilaria e pintura com proposta de valor direta, prova social com 6 depoimentos reais do Google (nota 4,9 com 79 avaliações), atendimento a todas as seguradoras (livre escolha da oficina pelo cliente), simulador de parcelamento (3x sem juros ou 5% OFF à vista/PIX), galeria com fotos e vídeos reais das instalações (câmara de pintura, equipe, pátio) e formulário de orçamento instantâneo que despacha mensagem pré-formatada para o WhatsApp da oficina.
- **Público-alvo**: Proprietários de veículos em Mailasqui, São Roque e região metropolitana/Sorocaba que sofreram colisões, pequenos amassados, precisam de pintura profissional, revisão preventiva ou acionaram seguro e buscam transparência e acabamento de alto padrão.
- **Objetivo central de conversão**: Conduzir o visitante a solicitar orçamento no WhatsApp (`https://wa.me/5511995625484`), identificando a seção de origem no texto da mensagem (`[site-hero]`, `[site-servicos]`, `[site-seguradoras]`, `[site-form]`).

---

## 2. User Experience & Visual Design

### A. Fluxo de Navegação e Seções (Ordem Estruturada)
1. **Header Fixo (Top Bar Contract)**:
   - Zona 1: Logo oficial `logo-garagem-mailasque.png` com link para o topo.
   - Zona 2: Links de navegação ancorados (*Serviços*, *Diferenciais*, *Galeria*, *Avaliações*, *Condições*, *Localização*) com `whitespace-nowrap` e menu mobile em drawer acessível (foco preso, Esc para fechar).
   - Zona 3: CTA de ação imediata: "Pedir orçamento".
2. **Hero Section**:
   - Headline H1 em destaque: *"Funilaria e pintura automotiva para devolver ao seu carro a aparência de zero km"*.
   - Subtítulo com localização estratégica: *"Atendimento transparente, cuidadoso e ágil em Mailasqui, São Roque/SP e região"*.
   - Prova social adjacente: Selo *"4,9 no Google (79 avaliações)"* com link direto para o Google Maps.
   - Badges de confiança textuais: *"Atendemos todas as seguradoras · Escolha livre da oficina"*.
   - CTAs: Primário *"Solicitar orçamento no WhatsApp"* e secundário *"Ver serviços"*.
3. **Serviços Especializados (4 Cards)**:
   - Grid de 4 serviços: *Funilaria*, *Pintura*, *Martelinho*, *Revisão preventiva*.
   - Ícones dedicados (Lucide), síntese em 1-2 linhas de acabamento impecável (sem prazos inventados), e link individual para WhatsApp pré-configurado com o serviço escolhido.
4. **Seguradoras ("Seu carro, sua escolha de oficina")**:
   - Explicação clara dos direitos do segurado no Brasil (liberdade legal de escolher a oficina de preferência para o conserto do sinistro).
   - Botão rápido: *"Fiz sinistro, como funciona no WhatsApp"*.
5. **Diferenciais & Como Funciona**:
   - Etapas do atendimento: *1. Orçamento transparente* → *2. Aprovação detalhada* → *3. Execução cuidadosa* → *4. Entrega com acabamento impecável*.
6. **Galeria da Oficina & Lightbox de Vídeos**:
   - Fotos reais otimizadas em WebP: câmara de pintura moderna, recepção para clientes, equipe técnica, estacionamento amplo com entrada acessível.
   - Vídeos demonstrativos dos processos de funilaria/repintura com posters estáticos e acionamento sob clique em modal lightbox.
7. **Avaliações Verificadas do Google**:
   - Destaque da nota 4,9 / 79 avaliações com botão "Ver todas no Google Maps".
   - Carrossel acessível com navegação por teclado e botões anterior/próximo contendo os 6 depoimentos reais autorizados (`src/data/testimonials.ts`).
8. **Condições de Pagamento & Simulador Interativo**:
   - Destaque: *"3x sem juros no cartão ou 5% OFF no PIX / à vista"* (aceita crédito, débito e aproximação/NFC).
   - Simulador client-side: visitante insere um valor estimado de referência e visualiza na hora o valor das 3 parcelas e a economia de 5% no PIX, acompanhado do aviso fixo de simulação ilustrativa.
9. **Parceria APVS Brasil**:
   - Bloco institucional com a imagem oficial da parceria (`avps-protecao-veicular.jpg`), rotulado como *"Parceria · Ponto de Venda Cadastrado"* e nota *"Serviço oferecido pela APVS Brasil"*, unindo estética e proteção patrimonial.
10. **Formulário de Orçamento Instantâneo**:
    - Campos essenciais: Nome, WhatsApp com máscara DDD, Serviço desejado (select), Modelo e ano do veículo, "É pelo seguro?" (Sim/Não).
    - Checkbox de consentimento com link para a Política de Privacidade (LGPD).
    - Validação em tempo real acessível (`aria-describedby` e `role="alert"`).
    - Ação: gera a mensagem pré-formatada codificada em URL e redireciona para o WhatsApp da Garagem Mailasque.
11. **Perguntas Frequentes (FAQ)**:
    - Acordeão nativo acessível (`details`/`summary`) respondendo apenas a dúvidas factuais baseadas nos dados fornecidos: seguradoras, formas de pagamento, como enviar fotos do carro e localização.
12. **Localização & Acessibilidade**:
    - Endereço completo em texto clicável: *Rod. Raposo Tavares, Km 54,65, Pinheirinho, Mailasqui, São Roque/SP*.
    - Mapa interativo/incorporado com `loading="lazy"` e botão direto *"Como chegar no Google Maps"*.
    - Nota de acessibilidade: *"Entrada com acesso para cadeirantes"*.
13. **Rodapé Completo (Footer)**:
    - Dados fiscais: Razão/Nome, CNPJ `07.540.332/0001-08`.
    - Redes sociais: Instagram (`@garagem.mailasque`) e Facebook oficial.
    - Links legais para Modal de Política de Privacidade e Termos de Uso.
    - Declaração de controladoria: *"Os dados enviados neste site são de responsabilidade da Garagem Mailasque (controladora)"*.
    - Crédito discreto: *"Desenvolvido por ēloSites"*.
14. **Floating WhatsApp Button**:
    - Botão fixo no canto inferior com tooltip e pulso suave a cada intervalo, acessível via teclado, com mensagem inicial genérica `[site-flutuante]`.

### B. Identidade Visual & Design Tokens
- **Tema escuro profissional (Oficina de Alta Performance)**:
  - Fundo principal: `#0E0E0E` (obsidiana profundo).
  - Superfícies de cards e seções: `#171717` e `#1F1F1F`.
  - Destaque primário (Laranja mecânico): `#F97316` / `#EA580C` calibrado para casar com o logotipo da Garagem Mailasque.
  - Texto sobre fundo laranja: **Preto puro `#0A0A0A`** em botões e CTAs para assegurar taxa de contraste WCAG AA > 5:1 (texto branco sobre laranja falha nos padrões de acessibilidade).
  - Acentos metálicos: Prata e titânio `#C9CDD2` em divisórias e bordas sutis de 1px.
- **Tipografia**:
  - Títulos & Display: `Barlow Condensed` / `Oswald` (Google Fonts), transmitindo solidez, potência e precisão mecânica.
  - Corpo & Dados: `Plus Jakarta Sans`, garantindo máxima legibilidade em telas de alta densidade e dispositivos móveis.
  - Números e métricas: `tabular-nums` para alinhamento perfeito.

---

## 3. Key Product Decisions & Trade-Offs

- **WhatsApp como destino único de conversão**: Em negócios automotivos locais, cotações dependem de fotos dos danos no carro (colisões, arranhões). Levar o cliente com dados estruturados para o WhatsApp diminui a fricção a quase zero e permite envio imediato de fotos pelo chat.
- **Nenhum backend proprietário para envio de dados**: Reduz custos de infraestrutura e riscos de segurança da informação (zero armazenamento de senhas ou dados sensíveis em servidores).
- **Tráfego Pago preparado sob variáveis de ambiente**: GA4, Google Tag Manager e Meta Pixel só são instanciados se as variáveis `VITE_GA4_ID`, `VITE_GTM_ID` e `VITE_META_PIXEL_ID` estiverem definidas e com consentimento LGPD aceito.
- **Extração local de assets reais**: Todos os arquivos do zip anexado serão organizados em `/public/assets/images/` e `/public/assets/videos/`.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Vite SPA                                  │
│                                                                        │
│  ┌───────────────────────┐         ┌────────────────────────────────┐  │
│  │   index.html (SEO)    │         │  src/data/                     │  │
│  │  - JSON-LD AutoBody   │         │  - business.ts (Dados Únicos)  │  │
│  │  - OpenGraph / Meta   │         │  - testimonials.ts (Google)    │  │
│  │  - Fonts: Barlow/PJS  │         │  - services.ts (4 Serviços)    │  │
│  └───────────┬───────────┘         └───────────────┬────────────────┘  │
│              │                                     │                   │
│              ▼                                     ▼                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                         App.tsx Root                             │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌───────────────────────────┐ │  │
│  │  │ Header & Nav │ │ Hero Section │ │ Services & Insurers Grid  │ │  │
│  │  └──────────────┘ └──────────────┘ └───────────────────────────┘ │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌───────────────────────────┐ │  │
│  │  │ Real Gallery │ │ Testimonials │ │ Payment Simulator         │ │  │
│  │  │ (Lightbox)   │ │ Google 4.9   │ │ (3x / 5% OFF)             │ │  │
│  │  └──────────────┘ └──────────────┘ └───────────────────────────┘ │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌───────────────────────────┐ │  │
│  │  │ APVS Partner │ │ Quote Form   │ │ FAQ Accordion             │ │  │
│  │  │ Block        │ │ (WhatsApp)   │ │ Location & Footer         │ │  │
│  │  └──────────────┘ └──────────────┘ └───────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Analytics & Privacy: CookieBanner (LGPD) + wa.me link generators │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Estrutura de Arquivos Planejada:
- `src/data/business.ts`: Fonte única da verdade com todas as informações institucionais, links, telefones, CNPJ, coordenadas e tags de seguro.
- `src/data/testimonials.ts`: Os 6 depoimentos reais com autorização expressa.
- `src/data/services.ts`: Detalhes dos 4 serviços com templates de mensagens WhatsApp.
- `src/components/Header.tsx`, `Hero.tsx`, `Services.tsx`, `Insurers.tsx`, `Workflow.tsx`, `Gallery.tsx`, `LightboxModal.tsx`, `Testimonials.tsx`, `PaymentSimulator.tsx`, `PartnerApvs.tsx`, `QuoteForm.tsx`, `Faq.tsx`, `Location.tsx`, `Footer.tsx`, `FloatingWhatsApp.tsx`, `PrivacyModal.tsx`, `CookieConsent.tsx`.
- `public/sitemap.xml` e `public/robots.txt`: Gerados com o script Python fornecido.

---

## 5. Verification Plan

1. **Compilação e Verificação Estática**: Execução de `npm run build` e verificação de tipagem estrita com TypeScript sem warnings.
2. **Acessibilidade e Contraste**: Verificação de contraste de cores (botões laranja com texto preto, `:focus-visible` ativo, alvos $\ge 44\text{px}$).
3. **Responsividade Multi-Dispositivo**: Validação em viewports 360px (mobile), 768px (tablet) e 1440px (desktop).
4. **Fluxos de Conversão**: Teste dos links e formulário com redirecionamento correto para `wa.me` contendo mensagem formatada e codificada com sucesso.
5. **Auditoria de `TODO_CLIENT`**: Busca por marcadores pendentes para listar com exatidão o que depende de envio futuro pelo cliente.
