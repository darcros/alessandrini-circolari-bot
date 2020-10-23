import { readFileSync } from 'fs';
import { scrapeNewsList, scrapeNewsPage } from '../src/news';

describe('scraping', () => {
  test('scrapes news list correctly', () => {
    const newsList = readFileSync(
      'test/fixtures/pages/circolari.html'
    ).toString();

    const scraped = scrapeNewsList(newsList);
    expect(scraped).toMatchSnapshot();
  });

  test('scrapes news correctly', () => {
    const news = readFileSync('test/fixtures/pages/circolare.html').toString();

    const scraped = scrapeNewsPage(news);
    expect(scraped).toMatchSnapshot();
  });
});
