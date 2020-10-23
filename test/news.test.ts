import { readFileSync } from 'fs';
import { ScrapedNews, scrapeNewsList, scrapeNewsPage } from '../src/news';

describe('scraping', () => {
  test('scrapes news list correctly', () => {
    const newsList = readFileSync(
      'test/fixtures/pages/circolari.html'
    ).toString();
    const newsListJson: string[] = JSON.parse(
      readFileSync('test/fixtures/scraped/newsList.json').toString()
    );

    const scraped = scrapeNewsList(newsList);
    expect(scraped).toEqual(newsListJson);
  });

  test('scrapes news correctly', () => {
    const news = readFileSync('test/fixtures/pages/circolare.html').toString();
    const newsJson: ScrapedNews = JSON.parse(
      readFileSync('test/fixtures/scraped/news.json').toString(),

      // converte il campo date da una stringa ad un oggetto Date quando viene letto il file Json
      (key, value) => (key === 'date' ? new Date(value) : value)
    );

    const scraped = scrapeNewsPage(news);
    expect(scraped).toEqual(newsJson);
  });
});
