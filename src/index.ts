import * as dotenv from 'dotenv';

import { createCache } from './cache';
import { scrapeNews } from './news';
import { getEnabledBots } from './platforms';
import { getEnv } from './util';

// Carica variabili d'ambiente da .env
dotenv.config();

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

  const bots = getEnabledBots(cache);
  if (bots.length === 0) {
    console.error('Tutte le piattaforme sono disabilitate!');
  }

  for (const bot of bots) {
    try {
      console.info(`Invio ${newsList.length} messaggi su Telegram`);
      await bot.send(newsList);
    } catch (err) {
      console.error(
        `Errore nell'invio sulla piattaform ${bot.platformName}`,
        err
      );
    }
  }

  console.info('finito');
}

main();
