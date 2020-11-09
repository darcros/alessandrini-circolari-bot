import * as dotenv from 'dotenv';

import { createCache } from './cache';
import { scrapeNews } from './news';
import { createDiscordBot } from './platforms/discord';
import { createTelegramBot } from './platforms/telegram';
import { getEnv } from './util';

// Carica variabili d'ambiente da .env
dotenv.config();

const TELEGRAM_TOKEN = getEnv('TELEGRAM_TOKEN');
const TELEGRAM_CHANNEL_ID = getEnv('TELEGRAM_CHANNEL_ID');
const DISCORD_WEBHOOK_ID = getEnv('DISCORD_WEBHOOK_ID');
const DISCORD_WEBHOOK_TOKEN = getEnv('DISCORD_WEBHOOK_TOKEN');
const BASE_URL = getEnv(
  'BASE_URL',
  'https://www.alessandrinimainardi.edu.it/categoria/circolari'
);
const CACHE_PATH = getEnv('CACHE_PATH', './data/cache.json');

async function main() {
  const cache = createCache(CACHE_PATH);
  const telegramBot = createTelegramBot(
    TELEGRAM_TOKEN,
    TELEGRAM_CHANNEL_ID,
    cache
  );
  const discordBot = createDiscordBot(
    DISCORD_WEBHOOK_ID,
    DISCORD_WEBHOOK_TOKEN,
    cache
  );

  console.info('Ottengo elenco circolari...');
  const newsList = await scrapeNews(cache, BASE_URL);
  console.info(`Ottenute ${newsList.length} circolari.`);

  console.info(`Invio ${newsList.length} messaggi`);
  await telegramBot.send(newsList);
  await discordBot.send(newsList);
  console.info('finito');
}

main();
