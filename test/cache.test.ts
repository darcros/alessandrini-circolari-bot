import { mkdir, rmdir } from 'fs/promises';
import { createCache, Cache } from '../src/cache';

describe('cache', () => {
  let cache: Cache;

  beforeEach(async () => {
    await mkdir('test/tmp/');
    cache = createCache('test/tmp/cache.json');
  });

  afterEach(async () => {
    await rmdir('test/tmp', { recursive: true });
  });

  test('key does not exist and value does not exists', async () => {
    const isPresent = await cache.hasValue('foo', 'bar');
    expect(isPresent).toBe(false);
  });

  test('key exists but value does not exists', async () => {
    await cache.addValue('foo', 'bar');
    const isPresent = await cache.hasValue('foo', 'baz');
    expect(isPresent).toBe(false);
  });

  test('key exists and value exists', async () => {
    await cache.addValue('foo', 'bar');

    const isPresent = await cache.hasValue('foo', 'bar');
    expect(isPresent).toBe(true);
  });

  test('multiple values', async () => {
    await cache.addValue('foo', 'bar');
    await cache.addValue('foo', 'baz');

    expect(cache.hasValue('foo', 'bar')).resolves.toBe(true);
    expect(cache.hasValue('foo', 'baz')).resolves.toBe(true);
    expect(cache.hasValue('foo', 'qux')).resolves.toBe(false);
  });

  test('get all values for a key', async () => {
    await cache.addValue('foo', 'bar');
    await cache.addValue('foo', 'baz');

    const values = await cache.getValues('foo');
    expect(values.size).toBe(2);
    expect(values.has('bar')).toEqual(true);
    expect(values.has('baz')).toEqual(true);
  });

  test('get all values for nonexistent key', async () => {
    const values = await cache.getValues('foo');
    expect(values.size).toBe(0);
  });

  test('add all keys', async () => {
    await cache.addKeys(['foo', 'bar']);
    expect(cache.getValues('foo')).resolves.toStrictEqual(new Set());
    expect(cache.getValues('bar')).resolves.toStrictEqual(new Set());
  });

  test('add all keys with duplicates', async () => {
    await cache.addKeys(['foo', 'foo', 'bar']);
    expect(cache.getValues('foo')).resolves.toStrictEqual(new Set());
    expect(cache.getValues('bar')).resolves.toStrictEqual(new Set());
  });

  test('add all keys with already present', async () => {
    await cache.addValue('foo', 'a');
    await cache.addKeys(['foo', 'bar']);
    expect(cache.getValues('foo')).resolves.toStrictEqual(new Set(['a']));
    expect(cache.getValues('bar')).resolves.toStrictEqual(new Set());
  });

  test('for each', async () => {
    await cache.addValue('foo', 'a');
    await cache.addValue('foo', 'b');
    await cache.addValue('bar', 'c');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    const mockCallback = jest.fn((key: string, values: Set<string>) => {});

    await cache.forEach(mockCallback);
    expect(mockCallback.mock.calls).toHaveLength(2);

    expect(mockCallback.mock.calls).toContainEqual([
      'foo',
      new Set(['a', 'b']),
    ]);
    expect(mockCallback.mock.calls).toContainEqual(['bar', new Set(['c'])]);
  });
});
