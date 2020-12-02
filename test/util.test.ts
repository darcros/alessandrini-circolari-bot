import { getEnv, chunk, allSuccessfull, mapObject, toMap } from '../src/util';

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

describe('array to map', () => {
  interface Obj {
    key: string;
    prop?: string;
    otherProp?: string;
  }

  const getKey = (obj: Obj) => obj.key;

  describe('empty array', () => {
    expect(toMap([], getKey)).toStrictEqual(new Map());
  });

  describe('collect into map', () => {
    const a = { key: 'foo', prop: 'a' };
    const b = { key: 'bar', otherProp: 'b' };
    const c = { key: 'baz', prop: 'z' };

    const arr = [a, b, c];
    const expected = new Map<string, Obj>([
      [a.key, a],
      [b.key, b],
      [c.key, c],
    ]);

    expect(toMap(arr, getKey)).toStrictEqual(expected);
  });

  describe('on conflicting keys last element overwrites first', () => {
    const a = { key: 'foo', prop: 'a' };
    const b = { key: 'bar', otherProp: 'b' };
    const c = { key: 'foo', prop: 'z' };

    const arr = [a, b, c];
    const expected = new Map<string, Obj>([
      [b.key, b],
      [c.key, c],
    ]);

    expect(toMap(arr, getKey)).toStrictEqual(expected);
  });
});

describe('map object', () => {
  const mapper = (s: string) => s + '-mapped';

  test('empty object', () => {
    expect(mapObject({}, mapper)).toStrictEqual({});
  });

  test('maps properties', () => {
    const obj = {
      a: 'foo',
      b: 'bar',
      c: 'baz',
    };

    const expected = {
      a: mapper(obj.a),
      b: mapper(obj.b),
      c: mapper(obj.c),
    };

    expect(mapObject(obj, mapper)).toStrictEqual(expected);
  });
});

describe('promises allSuccessfull', () => {
  test('empty array', () => {
    expect(allSuccessfull([])).resolves.toHaveLength(0);
  });

  test('filters all rejected promises', () => {
    const promises = [
      Promise.resolve('foo'),
      Promise.reject('bar'),
      Promise.resolve('baz'),
    ];

    expect(allSuccessfull(promises)).resolves.toStrictEqual(['foo', 'baz']);
  });
});
