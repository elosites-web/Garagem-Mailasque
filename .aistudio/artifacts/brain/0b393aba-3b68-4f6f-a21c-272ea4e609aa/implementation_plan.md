# Ajuste do Comparador Honda City: Formato Panorâmico com Deslize Vertical (Concluído)

Atualização das diretrizes e comportamento do comparador Antes e Depois da Garagem Mailasque.

## Mudanças Executadas:

- [x] **Formato Panorâmico Tradicional em Paisagem**: Mantido em container amplo `max-w-5xl mx-auto` com proporções `aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9]` responsivas para mobile, tablet e desktop.
- [x] **Enquadramento Centralizado**: `object-cover object-center` em ambas as fotos.
- [x] **Deslize da Barra na Vertical**:
  - Linha divisória horizontal percorre de 0% (topo) a 100% (base) baseada nas coordenadas Y do cursor ou toque (`cursor-ns-resize`).
  - Manopla interativa central com ícone `ArrowUpDown`, acessibilidade `aria-orientation="vertical"`, suporte a teclado (Setas Cima/Baixo/Esquerda/Direita, Home, End, PageUp/PageDown).
- [x] **Antes Acima do Depois**:
  - A camada do "Antes" (preparação com primer) sobrepõe a do "Depois" com recorte vertical `clipPath: inset(0 0 ${100 - sliderPosition}% 0)`.
  - Conforme o usuário arrasta para baixo, revela mais do "Antes" (topo); conforme arrasta para cima, revela o "Depois" (base/verniz finalizado).
- [x] **Etiquetas de Identificação Verticais**: "Antes (Topo)" no canto superior esquerdo e "Depois (Base)" no canto inferior esquerdo.
- [x] **Transição Suave de 500ms**: Fade-in suave preservado no carregamento das imagens.
