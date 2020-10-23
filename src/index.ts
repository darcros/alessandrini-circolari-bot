import { format } from 'date-fns';
import * as dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import { confirmSent } from './cache';
import { scrapeNews } from './news';

import { getEnv, fixMultinePadding } from './util';

// Carica variabili d'ambiente da .env
dotenv.config();

const TELEGRAM_TOKEN = getEnv('TELEGRAM_TOKEN');
const TELEGRAM_CHANNEL_ID = getEnv('TELEGRAM_CHANNEL_ID');
const BASE_URL = getEnv('BASE_URL', 'https://www.alessandrinimainardi.edu.it/categoria/circolari');

async function main() {
  console.info('Ottengo elenco circolari...');
  const newsList = await scrapeNews(BASE_URL);
  console.info(`Ottenute ${newsList.length} circolari.`);

  const bot = new Telegraf(TELEGRAM_TOKEN);

  console.info(`Invio ${newsList.length} messaggi`);
  for (const news of newsList) {
    const message = `
      *📄 Circolare*
      [${news.title}](${news.absoluteUrl})

      📒 Numero: ${news.id}
      📆 Data: ${format(news.date, 'dd/MM/yyyy')}

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
    await confirmSent(news.url);
  }
  console.info('finito');
}

main();
