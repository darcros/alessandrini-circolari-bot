import { format } from 'date-fns';
import * as dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import { scrapeNews } from './news';

import { requireEnv, fixMultinePadding } from './util';

// Carica variabili d'ambiente da .env
dotenv.config();

const TELEGRAM_TOKEN = requireEnv('TELEGRAM_TOKEN');
const BASE_URL = requireEnv('BASE_URL');
const TELEGRAM_CHANNEL_ID = requireEnv('TELEGRAM_CHANNEL_ID');

async function main() {
  console.info('Ottengo elenco circolari...');
  const newsList = await scrapeNews(BASE_URL);
  console.info(`Ottenute ${newsList.length} circolari.`);

  const bot = new Telegraf(TELEGRAM_TOKEN);

  console.info(`Invio ${newsList.length} messaggi`)
  for (const news of newsList) {
    const message = `
      📄Circolare numero ${news.id} del ${format(news.date, 'dd/MM/yyyy')}
      
      [${news.title}](${news.absoluteUrl})
    `;

    await bot.telegram.sendMessage(TELEGRAM_CHANNEL_ID, fixMultinePadding(message), { parse_mode: 'MarkdownV2' });
  }
  console.info('finito');
}

main();
