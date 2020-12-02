import cheerio from 'cheerio';
import { parse } from 'date-fns';
import TurndownService from 'turndown';

const turndownService = new TurndownService();

export function scrapeNewsList(page: string): string[] {
  const $ = cheerio.load(page);

  const urls: string[] = [];

  $('.view-content > .views-row').each((_i, tag) => {
    const newsElement = $(tag);

    const titleElement = newsElement.find(
      '.views-field-title > .field-content > a'
    );
    const url = titleElement.attr('href');

    urls.push(url);
  });

  return urls;
}

export interface Attachemnt {
  name: string;
  url: string;
}

export interface ScrapedNews {
  title: string;
  id: string;
  text: string;
  date: Date;
  attachments: Attachemnt[];
}

export function scrapeNewsPage(page: string): ScrapedNews {
  const $ = cheerio.load(page);

  const title = $('#page-title').text();

  const dateString = $(
    '.field.field-name-field-data-emissione > .field-item > .date-display-single'
  ).text();

  // la data passata come ultimo argoemnto serve a prendere i dati che non vengono specificati esplicitamente dalla stringa,
  // ovvero le ore, minuti, secondi, millisecondi
  // usare la data 0 li imposta tutti a 0
  const date = parse(dateString, 'dd/MM/yyyy', new Date(0));

  const id = $(
    '.field.field-name-field-circolare-protocollo > .field-item'
  ).text();

  const textHtml = $('.field.field-name-body > .field-item').html();
  const text = turndownService.turndown(textHtml);

  // NOTE: tra .field-item e .file c'è uno spazion e non un >
  // non è fatto a caso, è perchè ci sono altri elementi in mezzo
  const attachments: Attachemnt[] = $(
    '.field.field-name-field-circ-all-riservati > .field-item .file > a'
  )
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
    text,
    attachments,
  };
}

export interface News extends ScrapedNews {
  url: string;
  absoluteUrl: string;
}
