# Garagem Mailasque — Landing Page de Alta Conversão

Landing page profissional para a **Garagem Mailasque**, especializada em funilaria e pintura automotiva em Mailasqui (São Roque/SP).

## 🚀 Como Rodar o Projeto

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (porta 3000)
npm run dev

# Gerar build de produção
npm run build
```

---

## 📝 Como Editar Textos, Dados e Fotos

Todos os dados da empresa e avaliações estão separados da lógica dos componentes na pasta `src/data/`:

1. **Dados Gerais da Oficina (`src/data/business.ts`)**:
   - Telefone / WhatsApp e mensagens de contato
   - Endereço, coordenadas do mapa e links sociais
   - Condições de pagamento (parcelamento e desconto no PIX)
   - Horário de funcionamento semanal e nota de feriados

2. **Serviços (`src/data/services.ts`)**:
   - Edição de títulos, descrições e itens de destaque dos 4 serviços oficiais (Funilaria, Pintura, Martelinho, Revisão preventiva).

3. **Depoimentos Reais (`src/data/testimonials.ts`)**:
   - Adicionar ou atualizar depoimentos autorizados de clientes reais do Google.

4. **Galeria de Fotos e Vídeos (`src/data/gallery.ts`)**:
   - Adicionar novas fotos ou vídeos salvos na pasta `/public/assets/garagemailasque/`.

## 🌐 Domínio de Produção & Variáveis de Ambiente

O domínio oficial registrado para a oficina é:
- **`https://www.garagemmailasque.com.br`** (com `www` e grafia com dois "m": *garagem* + *mailasque*).

No arquivo `.env.example`, a variável canônica é definida como:
```env
VITE_SITE_URL="https://www.garagemmailasque.com.br"
```
A constante `SITE_URL` em `src/data/business.ts` lê essa variável e atua como fonte única da verdade para todas as URLs absolutas (Open Graph, Twitter Cards, Schema.org e links canônicos).

---

## 📊 Mensuração e Tráfego Pago (Opcional)

Os scripts de rastreamento do Google Analytics 4, Google Tag Manager e Meta Pixel **não são carregados** por padrão para manter o site leve e veloz.

Quando for iniciar campanhas de tráfego pago (Google Ads / Meta Ads):
1. Crie um arquivo `.env` na raiz do projeto (baseado em `.env.example`).
2. Preencha as variáveis correspondentes:
   ```env
   VITE_SITE_URL="https://www.garagemmailasque.com.br"
   VITE_GA4_ID="G-XXXXXXXXXX"
   VITE_GTM_ID="GTM-XXXXXXX"
   VITE_META_PIXEL_ID="XXXXXXXXXXXXXXX"
   ```
3. O banner de consentimento de cookies da LGPD será ativado automaticamente.

---

## 🛠️ SEO e Arquivos do Robô

Para regenerar `sitemap.xml` e `robots.txt`:
```bash
python3 public/assets/aistudio/gerar_seo_9bf9c7cf.py --dominio https://www.garagemmailasque.com.br --saida ./public --paginas /
```
