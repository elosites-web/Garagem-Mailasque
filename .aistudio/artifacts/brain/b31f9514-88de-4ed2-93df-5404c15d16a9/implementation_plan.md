# Atualização Visual dos CTAs, Reposicionamento do Comparador e Nova Identidade Laranja do WhatsApp

Plano arquitetural e de design para padronizar todos os botões de conversão (CTAs) com o logotipo oficial do WhatsApp, reposicionar o comparador antes e depois para a posição de maior impacto comercial (logo abaixo dos serviços) e adaptar o botão flutuante para a identidade visual premium em laranja da Garagem Mailasque com logotipo em preto.

## Decisões Críticas e Preferências Confirmadas

> [!IMPORTANT]
> As preferências estéticas e comportamentais foram alinhadas e confirmadas:
> - **Identidade Laranja e Preto no WhatsApp Flutuante**: O botão flutuante adota a paleta da oficina (`#F97316` / `#EA580C` / `#0A0A0A`), com o ícone oficial do WhatsApp em preto absoluto `#0A0A0A`. O painel interno de chat e balão proativo também acompanham essa paleta com detalhes em laranja escuro e acentos de marca.
> - **Efeito de Pulso e Elevação**: O botão conta com animação de aura suave em tons de laranja/âmbar, brilho luminoso e elevação ao passar o mouse (`translateY(-2px)` e escala `1.05`).
> - **Ícones dos Botões de CTA**: Todos os botões principais de chamada para ação que direcionam ao WhatsApp (`Header`, `Hero`, `Services`, `Insurers`, `PaymentSimulator`, `PartnerApvs`, `QuoteForm`) passam a exibir o logotipo oficial vetorial do WhatsApp em substituição aos ícones genéricos de mensagem (`MessageSquare`, `Send`).
> - **Posição do Comparador Visual**: A seção `<BeforeAfterSlider />` é movida para ficar imediatamente após a seção `<Services />`, capturando o visitante no momento de maior interesse após conhecer os serviços prestados.

---

## 1. Visão Geral e Conceito

O objetivo desta refatoração é aumentar o reconhecimento de canal e a taxa de conversão da landing page, garantindo que o visitante identifique instantaneamente que qualquer clique de orçamento abre uma conversa direta no WhatsApp da oficina. Ao mesmo tempo, o botão flutuante passa a se integrar de forma orgânica à identidade visual robusta e automotiva da Garagem Mailasque (laranja vibrante sobre fundo escuro), abandonando o verde genérico.

```
┌─────────────────────────────────────────────────────────────────┐
│                           HEADER                                │
│   [Logo Garagem Mailasque]  ...Menu...  [ (WA) Pedir orçamento ] │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                            HERO                                 │
│  "Funilaria e Pintura Automotiva..."                            │
│  [ (WA) Solicitar orçamento no WhatsApp ] [ Ver serviços ]      │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                          SERVIÇOS                               │
│  Funilaria · Pintura · Martelinho de Ouro · Revisão Preventiva   │
│  Cards individuais com botão: [ (WA) Orçar Serviço ↗ ]         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼ (NOVA ORDEM SOLICITADA)
┌─────────────────────────────────────────────────────────────────┐
│                  COMPARADOR VISUAL ANTES & DEPOIS               │
│  Honda City: Recuperação Técnica vs. Substituição de Peça       │
│  Controle interativo vertical com acabamento de alta precisão    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SEGURADORAS                              │
│  "Seu carro, sua escolha de oficina..."                         │
│  [ (WA) Fiz sinistro, como funciona? → ]                        │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                 COMO FUNCIONA / WORKFLOW                        │
│  4 etapas transparentes                                         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
                 ... Demais seções da página ...
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BOTÃO FLUTUANTE DO WHATSAPP                  │
│  Círculo Laranja (#F97316) + Aura Âmbar + Logotipo WA em Preto  │
│  Painel de atendimento coordenado em preto, carvão e laranja    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Experiência do Usuário e Design Visual

### 2.1 Padronização dos CTAs com Logotipo do WhatsApp
- Substituição de `MessageSquare` e `Send` pelo componente `WhatsAppIcon` (`/src/components/icons/WhatsAppIcon.tsx`):
  - **Header (Desktop)**: Botão "Pedir orçamento" com `<WhatsAppIcon className="w-4 h-4" />`.
  - **Header (Mobile Drawer)**: Botão "Pedir orçamento no WhatsApp" com `<WhatsAppIcon className="w-5 h-5" />`.
  - **Hero**: Botão primário "Solicitar orçamento no WhatsApp" com `<WhatsAppIcon className="w-5 h-5 shrink-0" />`.
  - **Services (Cards de Serviço)**: Cada um dos 4 botões "Orçar [Serviço]" com `<WhatsAppIcon className="w-4 h-4 shrink-0" />`.
  - **Insurers**: Botão "Fiz sinistro, como funciona?" com `<WhatsAppIcon className="w-4 h-4 shrink-0" />`.
  - **PaymentSimulator**: Botão "Pedir avaliação desse valor no WhatsApp" com `<WhatsAppIcon className="w-4 h-4 shrink-0" />`.
  - **PartnerApvs**: Botão "Saber mais sobre a APVS na oficina" com `<WhatsAppIcon className="w-4 h-4 text-[#F97316] shrink-0" />`.
  - **QuoteForm**: Botão principal de submissão do formulário ("Enviar dados e abrir no WhatsApp") com `<WhatsAppIcon className="w-5 h-5 shrink-0" />`.

### 2.2 Botão Flutuante e Painel de Chat Laranja & Preto
- **Botão Flutuante**:
  - Cor de fundo: Gradiente vibrante laranja automotivo `linear-gradient(135deg, #F97316 0%, #FB923C 35%, #EA580C 70%, #C2410C 100%)`.
  - Ícone do WhatsApp: `#0A0A0A` (preto carvão fosco), renderizado com nitidez em `w-7 h-7 sm:w-8 sm:h-8`.
  - Efeito de Aura e Pulso: Gradiente radial/anelar em tons de laranja (`from-[#EA580C] via-[#F97316] to-[#FB923C]`) pulsando suavemente a cada 3,2s, sem anéis recortados.
  - Efeito Hover: Elevação (`translateY(-2px)`), escala `1.05` e expansão de sombra `shadow-[0_16px_36px_-4px_rgba(0,0,0,0.65),0_0_32px_rgba(249,115,22,0.6)]`.
- **Painel de Chat do WhatsApp**:
  - Top bar do modal: Gradiente `from-[#C2410C] via-[#EA580C] to-[#F97316]` com tipografia legível e ícone da oficina.
  - Status "Online agora": Ponto indicador em verde ou âmbar suave com texto de resposta rápida.
  - Balão interno de mensagem: Estilo carvão escuro `#1F1F1F` com borda sutil e acento laranja na assinatura da Garagem Mailasque.
  - Botão de envio de mensagem do chat: Laranja `#F97316` com ícone de envio e foco acessível.
- **Balão Proativo de 60s**:
  - Fundo em preto translúcido com borda acentuada em laranja (`#F97316/30`).
  - CTA "Falar no WhatsApp" com tipografia laranja e micro-interação de seta inclinada.

### 2.3 Reposicionamento do Comparador Antes e Depois
- O fluxo cognitivo do visitante passa a ser:
  1. Conhecer a proposta de valor e credibilidade no Hero.
  2. Ver quais serviços a oficina realiza (Funilaria, Pintura, Martelinho, Revisão).
  3. **Comprovar imediatamente o resultado real**: Interagir com o comparador visual do Honda City antes e depois, demonstrando a recuperação da peça original e a pintura em câmara pressurizada.
  4. Continuar descendo para entender como proceder com seguradoras, workflow de 4 etapas, galeria, depoimentos e orçamento.
- Atualização da ordem do ScrollSpy no `Header.tsx` para sincronizar o indicador ativo de navegação com a nova sequência de seções.

---

## 3. Decisões de Engenharia e Boas Práticas

| Decisão | Abordagem Escolhida | Justificativa |
| :--- | :--- | :--- |
| **Componente de Ícone** | Reutilizar `WhatsAppIcon.tsx` com `fill="currentColor"` | Elimina duplicação, garante SVG vetorial otimizado com suporte dinâmico a cores (`text-black`, `text-[#0A0A0A]`, etc.). |
| **Ordem no DOM** | Mover `<BeforeAfterSlider />` em `App.tsx` | Preserva landmarks semânticos e sem quebras de layout ou hidratação. |
| **Animações e Performance** | CSS Keyframes acelerados por GPU (`transform`, `opacity`) | Respeita taxa de 60fps em dispositivos móveis e obedece `prefers-reduced-motion`. |
| **Acessibilidade WCAG 2.1 AA** | Contraste de texto do ícone preto sobre laranja (> 3:1 para gráficos UI) e outline de foco visível | Mantém navegabilidade total por teclado e leitores de tela sem perda de usabilidade. |

---

## 4. Arquitetura de Componentes e Estratégia de Implementação

```
[ App.tsx ]
   ├── Header (Atualizado com WhatsAppIcon no desktop e mobile)
   ├── Hero (Atualizado com WhatsAppIcon no CTA primário)
   ├── Services (Atualizado com WhatsAppIcon nos 4 cards)
   ├── BeforeAfterSlider (NOVA POSIÇÃO: logo abaixo de Services)
   ├── Insurers (Atualizado com WhatsAppIcon)
   ├── Workflow
   ├── Gallery
   ├── Testimonials
   ├── PaymentSimulator (Atualizado com WhatsAppIcon)
   ├── PartnerApvs (Atualizado com WhatsAppIcon)
   ├── QuoteForm (Atualizado com WhatsAppIcon no envio)
   ├── Faq
   ├── Location
   ├── Footer
   └── FloatingWhatsApp (Atualizado: Laranja + Ícone Preto + Aura Laranja + Painel Coordenado)
```

### Arquivos Impactados:
1. `src/App.tsx`: Reordenação de `<BeforeAfterSlider />` para logo abaixo de `<Services />`.
2. `src/components/Header.tsx`: Troca de `MessageSquare` por `WhatsAppIcon` nos CTAs e ajuste de ordem no scrollspy.
3. `src/components/Hero.tsx`: Troca de `MessageSquare` por `WhatsAppIcon` no CTA primário.
4. `src/components/Services.tsx`: Troca de `MessageSquare` por `WhatsAppIcon` nos botões de cotação dos 4 cards.
5. `src/components/Insurers.tsx`: Troca de `MessageSquare` por `WhatsAppIcon` no CTA de sinistro.
6. `src/components/PaymentSimulator.tsx`: Troca de `MessageSquare` por `WhatsAppIcon` no botão de envio da simulação.
7. `src/components/PartnerApvs.tsx`: Troca de `MessageSquare` por `WhatsAppIcon` no CTA de informações.
8. `src/components/QuoteForm.tsx`: Troca de `Send` por `WhatsAppIcon` no botão de submissão.
9. `src/components/FloatingWhatsApp.tsx`: Estilização do botão em laranja com ícone do WhatsApp em preto, aura gradiente laranja, e painel interno coordenado.
10. `src/index.css`: Atualização das keyframes e classes de animação do botão flutuante (`whatsapp-gradient-pulse-btn`, `animate-whatsapp-gradient-aura`, sombras e elevação).
