import * as dotenv from 'dotenv';
import axios from 'axios';

import { Cache, createCache } from './cache';
import { News, scrapeNewsList, scrapeNewsPage } from './news';
import { Bot, getEnabledBots } from './platforms';
import { allSuccessfull, getEnv, toMap, mapObject } from './util';

// Carica variabili d'ambiente da .env
dotenv.config();

const BASE_URL = getEnv(
  'BASE_URL',
  'https://www.alessandrinimainardi.edu.it/categoria/circolari'
);
const CACHE_PATH = getEnv('CACHE_PATH', './data/cache.json');

// scarica la lista di url dal sito e aggiungili alla cache se non ci sono già
async function cacheUrls(cache: Cache) {
  console.info('Ottengo elenco circolari dal sito...');
  const { data: newsListPage } = await axios.get<string>(BASE_URL);
  const newsUrlList = scrapeNewsList(newsListPage);
  await cache.addKeys(newsUrlList);
  console.info(
    `Trovate ${newsUrlList.length} circolari e aggiunte alla cache.`
  );
}

// trova tutti gli url che non sono stati spediti da lameno una delle piattaforme attiva
// e raggiuppali per piattaforma
type UrlsByPlatform = Record<string, string[]>;

async function findNotSentUrls(
  cache: Cache,
  bots: Bot[]
): Promise<UrlsByPlatform> {
  const urlsByPlatform: UrlsByPlatform = {};

  await cache.forEach((url, providers) => {
    for (const bot of bots) {
      // se il bot in questione non è tra quelli confermati, allora deve inviare questo url
      if (!providers.has(bot.platformName)) {
        const urls = urlsByPlatform[bot.platformName] || [];
        urlsByPlatform[bot.platformName] = [...urls, url];
      }
    }
  });

  return urlsByPlatform;
}

async function fetchNews(url: string): Promise<News> {
  const absoluteUrl = new URL(url, BASE_URL).toString();
  const { data: newsPage } = await axios.get<string>(absoluteUrl);
  const scraped = scrapeNewsPage(newsPage);

  return { ...scraped, url, absoluteUrl };
}

type NewsByPlatform = Record<string, News[]>;

async function fetchAllNews(
  urlsByPlatform: UrlsByPlatform
): Promise<NewsByPlatform> {
  const allUrls = Object.values(urlsByPlatform).flatMap((x) => x);
  const uniqueUrls = [...new Set(allUrls)];

  const news = await allSuccessfull(uniqueUrls.map((url) => fetchNews(url)));
  const newsByUrl = toMap(news, (news) => news.url);
  return mapObject(urlsByPlatform, (urls) =>
    urls.map((url) => newsByUrl.get(url))
  );
}

async function send(newsByPlatform: NewsByPlatform, bots: Bot[], cache: Cache) {
  for (const bot of bots) {
    const news = newsByPlatform[bot.platformName] || [];

    console.info(
      `Invio ${news.length} messaggi sulla piattaforma ${bot.platformName}`
    );
    const results = await bot.send(news);

    for (const result of results) {
      if (result.status === 'ok') {
        cache.addValue(result.news.url, bot.platformName);
      } else {
        console.error(
          `Errore nell'invio sulla piattaform ${bot.platformName}:`,
          result.error
        );
      }
    }
  }
}

async function main() {
  const bots = getEnabledBots();
  if (bots.length === 0) {
    console.error('Tutte le piattaforme sono disabilitate!');
    return;
  }

  const cache = createCache(CACHE_PATH);
  await cacheUrls(cache);
  const urlsByPlatform = await findNotSentUrls(cache, bots);
  const newsByPlatform = await fetchAllNews(urlsByPlatform);
  await send(newsByPlatform, bots, cache);

  console.info('finito');
}

main();
