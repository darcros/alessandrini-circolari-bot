import { getEnv, chunk } from '../src/util';

describe('environment variables', () => {
  beforeAll(() => {
    process.env['foo'] = 'something';
    delete process.env['bar'];
  });

  test('gets defined environemnt variable', () => {
    const env = getEnv('foo');
    expect(env).toBeDefined();
  });

  test('gets default values when environemnt variable is undefined', () => {
    const env = getEnv('bar', 'default');
    expect(env).toBe('default');
  });

  test('thows when getting undefined envornment variable without a default', () => {
    expect(() => getEnv('bar')).toThrowErrorMatchingSnapshot();
  });
});

describe('array chunk', () => {
  test('chunks empty array', () => {
    expect(chunk([], 3)).toStrictEqual([]);
  });

  test('chunks array of divisible size', () => {
    const arr = [1, 2, 3, 4, 5, 6];
    const chunked = [
      [1, 2, 3],
      [4, 5, 6],
    ];

    expect(chunk(arr, 3)).toStrictEqual(chunked);
  });

  test('cunks array of non-divisible size', () => {
    const arr = [1, 2, 3, 4, 5];
    const chunked = [
      [1, 2, 3],
      [4, 5],
    ];

    expect(chunk(arr, 3)).toStrictEqual(chunked);
  });
});
