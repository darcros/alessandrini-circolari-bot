import { format } from 'date-fns';
import * as dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import { createCache } from './cache';
import { scrapeNews } from './news';

import { getEnv, fixMultinePadding } from './util';

// Carica variabili d'ambiente da .env
dotenv.config();

const TELEGRAM_TOKEN = getEnv('TELEGRAM_TOKEN');
const TELEGRAM_CHANNEL_ID = getEnv('TELEGRAM_CHANNEL_ID');
const BASE_URL = getEnv(
  'BASE_URL',
  'https://www.alessandrinimainardi.edu.it/categoria/circolari'
);
const CACHE_PATH = getEnv('CACHE_PATH', './data/cache.json');

async function main() {
  const cache = createCache(CACHE_PATH);

  console.info('Ottengo elenco circolari...');
  const newsList = await scrapeNews(cache, BASE_URL);
  console.info(`Ottenute ${newsList.length} circolari.`);

  const bot = new Telegraf(TELEGRAM_TOKEN);

  console.info(`Invio ${newsList.length} messaggi`);
  for (const news of newsList) {
    const message = `
      *📄 Circolare*
      [${news.title}](${news.absoluteUrl})

      📒 Numero: ${news.id}
      📆 Data: ${format(news.date, 'dd/MM/yyyy')}

      ${news.text}

      ${news.attachments.length > 0 ? '🔗 Allegati' : ''}
      ${news.attachments
        .map((attachment) => `▪️[${attachment.name}](${attachment.url})`)
        .join('\n')}
    `;

    await bot.telegram.sendMessage(
      TELEGRAM_CHANNEL_ID,
      fixMultinePadding(message),
      {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }
    );
    await cache.add(news.url);
  }
  console.info('finito');
}

main();
