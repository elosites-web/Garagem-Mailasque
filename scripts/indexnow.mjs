#!/usr/bin/env node
/**
 * Script de submissão do IndexNow para notificar Bing, Yandex e outros buscadores
 * sobre atualizações na URL de produção da Garagem Mailasque.
 * Compatível com Node.js 22 (fetch nativo, ESM).
 */

const HOST = 'www.garagemmailasque.com.br';
const API_KEY = 'c748e42f9b874312ab63e17fa6a12df0';
const KEY_LOCATION = `https://${HOST}/${API_KEY}.txt`;
const URLS_TO_SUBMIT = [
  `https://${HOST}/`,
];

async function submitToIndexNow() {
  console.log(`[IndexNow] Notificando api.indexnow.org para host: ${HOST}...`);

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
      console.log(`[IndexNow] Sucesso! Status ${response.status} (${response.statusText || 'OK'}).`);
      console.log(`[IndexNow] ${URLS_TO_SUBMIT.length} URL(s) enviada(s) para indexação instantânea.`);
    } else {
      console.warn(`[IndexNow] Resposta com status ${response.status}: ${response.statusText}`);
      const text = await response.text();
      if (text) console.warn(`[IndexNow] Detalhes: ${text}`);
    }
  } catch (error) {
    console.error('[IndexNow] Erro ao submeter requisição:', error);
  }
}

submitToIndexNow();
