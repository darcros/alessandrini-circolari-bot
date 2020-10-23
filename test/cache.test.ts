import { mkdir, rmdir } from 'fs/promises';
import { wasSent, confirmSent } from '../src/cache';

describe('cache', () => {
  beforeAll(() => {
    process.env['CACHE_PATH'] = 'test/tmp/cache.json';
  });

  beforeEach(async () => {
    await mkdir('test/tmp/');
  });

  afterEach(async () => {
    await rmdir('test/tmp', { recursive: true });
  });

  test('never saved url is not saved', async () => {
    const sent = await wasSent('foo');
    expect(sent).toBe(false);
  });

  test('saved url is saved', async () => {
    await confirmSent('foo');

    const sent = await wasSent('foo');
    expect(sent).toBe(true);
  });
});
