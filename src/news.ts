import axios from 'axios';
import cheerio from 'cheerio';
import { parse } from 'date-fns';
import { URL } from 'url';
import { wasSent } from './cache';

function scrapeNewsList(page: string) {
  const $ = cheerio.load(page);

  const urls: string[] = [];

  $('.view-content > .views-row').each((_i, tag) => {
    const newsElement = $(tag);

    const titleElement = newsElement.find('.views-field-title > .field-content > a');
    const url = titleElement.attr('href');

    urls.push(url);
  });

  return urls;
}

export interface Attachemnt {
  name: string;
  url: string;
}

// TODO: scrape text
interface ScrapedNews {
  title: string;
  id: string;
  date: Date;
  attachments: Attachemnt[];
}

function scrapeNewsPage(page: string): ScrapedNews {
  const $ = cheerio.load(page);

  const title = $('#page-title').text();

  const dateString = $('.field.field-name-field-data-emissione > .field-item > .date-display-single').text();

  // la data passata come ultimo argoemnto serve a prendere i dati che non vengono specificati esplicitamente dalla stringa,
  // ovvero le ore, minuti, secondi, millisecondi
  // usare la data 0 li imposta tutti a 0
  const date = parse(dateString, 'dd/MM/yyyy', new Date(0));

  const id = $('.field.field-name-field-circolare-protocollo > .field-item').text();

  // NOTE: tra .field-item e .file c'è uno spazion e non un >
  // non è fatto a caso, è perchè ci sono altri elementi in mezzo
  const attachments: Attachemnt[] =
    $('.field.field-name-field-circ-all-riservati > .field-item .file > a')
      .toArray()
      .map((tag) => {
        const name = $(tag).text();
        const url = $(tag).attr('href');
        return { name, url };
      });

  return {
    title,
    date,
    id,
    attachments,
  };
}

async function filterNotSent(urls: string[]): Promise<string[]> {
  const promises = urls.map(async (url) => ({
    url,
    sent: await wasSent(url),
  }));

  const objs = await Promise.all(promises);
  return objs
    .filter(({ sent }) => !sent)
    .map(({ url }) => url);
}

export interface News {
  title: string;
  id: string;
  date: Date;
  url: string;
  absoluteUrl: string;
  attachments: Attachemnt[];
}

export async function scrapeNews(newsListPageUrl: string): Promise<News[]> {
  const { data: newsListPage } = await axios.get<string>(newsListPageUrl);

  const urls = scrapeNewsList(newsListPage);
  console.info(`Trovati ${urls.length} link`);

  const newUrls = await filterNotSent(urls);
  console.info(`Trovati ${newUrls.length} nuovi link`);

  const promises: Promise<News>[] = newUrls.map(async (url) => {
    const absoluteUrl = new URL(url, newsListPageUrl).toString();
    const { data: newsPage } = await axios.get<string>(absoluteUrl);
    const scraped = scrapeNewsPage(newsPage);

    return { ...scraped, url, absoluteUrl };
  });

  // Promise.all() fallisce se una promessa qualsiasi fallisce,
  // questo non fallisce mai, al massimo restituice un array vuoto
  const news = (await Promise.allSettled(promises))
    .flatMap(x => {
      if (x.status === 'rejected') {
        console.error('Errore con una circolare', x.reason);
      }

      return x.status === 'fulfilled' ? [x.value] : []
    });
  console.info(`scaricate ${news.length} nuova circolari`);

  // ordina dalla più vecchi alla più nuova
  return news.reverse();
}
