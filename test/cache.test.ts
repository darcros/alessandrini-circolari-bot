import { mkdir, rmdir } from 'fs/promises';
import { createCache, UrlCache } from '../src/cache';

describe('cache', () => {
  let cache: UrlCache;

  beforeEach(async () => {
    await mkdir('test/tmp/');
    cache = createCache('test/tmp/cache.json');
  });

  afterEach(async () => {
    await rmdir('test/tmp', { recursive: true });
  });

  test('never added url is not present', async () => {
    const sent = await cache.isPresent('foo');
    expect(sent).toBe(false);
  });

  test('added url is present', async () => {
    await cache.add('foo');

    const sent = await cache.isPresent('foo');
    expect(sent).toBe(true);
  });
});
