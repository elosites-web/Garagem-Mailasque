#!/usr/bin/env node
/**
 * Script de submissão do IndexNow para notificar Bing, Yandex e outros buscadores participantes
 * sobre atualizações na URL de produção da Garagem Mailasque.
 * Compatível com Node.js 22 (fetch nativo, ESM).
 * 
 * Uso:
 *   npm run indexnow
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const API_KEY = process.env.INDEXNOW_KEY || 'c748e42f9b874312ab63e17fa6a12df0';

// Determina o host de produção a partir de VITE_SITE_URL ou fallback canônico
let siteHost = 'www.garagemmailasque.com.br';
if (process.env.VITE_SITE_URL) {
  try {
    const parsed = new URL(process.env.VITE_SITE_URL);
    siteHost = parsed.host;
    if (siteHost === 'garagemmailasque.com.br') {
      siteHost = 'www.garagemmailasque.com.br';
    }
  } catch {
    // fallback padrão
  }
}

const HOST = siteHost;
const KEY_LOCATION = `https://${HOST}/${API_KEY}.txt`;
const URLS_TO_SUBMIT = [
  `https://${HOST}/`,
];

async function submitToIndexNow() {
  console.log(`[IndexNow] Iniciando verificação de pré-requisitos para ${HOST}...`);

  // Validação do arquivo de chave local na pasta public/
  const keyFilePath = path.join(rootDir, 'public', `${API_KEY}.txt`);
  if (!fs.existsSync(keyFilePath)) {
    console.error(`[IndexNow] ERRO: Arquivo de validação da chave não encontrado em: ${keyFilePath}`);
    console.error(`[IndexNow] O arquivo com o nome da chave deve existir na pasta public/ para que o motor de busca valide a posse do domínio.`);
    process.exit(1);
  }

  const keyFileContent = fs.readFileSync(keyFilePath, 'utf-8').trim();
  if (keyFileContent !== API_KEY) {
    console.warn(`[IndexNow] AVISO: O conteúdo de ${keyFilePath} ("${keyFileContent}") difere da chave configurada ("${API_KEY}").`);
  } else {
    console.log(`[IndexNow] Chave local validada com sucesso: public/${API_KEY}.txt`);
  }

  console.log(`[IndexNow] Enviando submissão para api.indexnow.org...`);
  console.log(`[IndexNow] Chave pública: ${API_KEY}`);
  console.log(`[IndexNow] Localização da chave: ${KEY_LOCATION}`);
  console.log(`[IndexNow] URLs a submeter (${URLS_TO_SUBMIT.length}): ${URLS_TO_SUBMIT.join(', ')}`);

  const payload = {
    host: HOST,
    key: API_KEY,
    keyLocation: KEY_LOCATION,
    urlList: URLS_TO_SUBMIT,
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      console.log(`[IndexNow] Sucesso! Código HTTP ${response.status} (${response.statusText || 'Aceito'}).`);
      console.log(`[IndexNow] Confirmação recebida: As URLs foram aceitas e enfileiradas para rastreamento pelo Bing e buscadores parceiros.`);
      console.log(`[IndexNow] Observação: O protocolo IndexNow notifica a alteração para priorização de rastreamento. A indexação final e ranqueamento dependem exclusivamente das diretrizes do buscador.`);
    } else {
      console.warn(`[IndexNow] Resposta com código ${response.status}: ${response.statusText}`);
      const text = await response.text();
      if (text) console.warn(`[IndexNow] Resposta da API: ${text}`);
      if (response.status === 422) {
        console.warn(`[IndexNow] Status 422 indica formato inválido de URL ou chave incompatível.`);
      } else if (response.status === 403) {
        console.warn(`[IndexNow] Status 403 indica que a chave em ${KEY_LOCATION} não pôde ser validada pelo buscador na web pública.`);
      }
    }
  } catch (error) {
    console.error('[IndexNow] Falha na requisição de rede:', error instanceof Error ? error.message : error);
    console.log('[IndexNow] Se estiver em ambiente sem acesso externo à internet, execute o script em ambiente de produção após deploy.');
  }
}

submitToIndexNow();
