import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

type MapCache = Map<string, Set<string>>;

type JsonCache = CacheEntry[];
interface CacheEntry {
  key: string;
  values: string[];
}

async function read(path: string): Promise<MapCache> {
  // read from disk
  let buf: Buffer;
  try {
    buf = await readFile(path);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return new Map();
    }
  }

  // map to cache object
  const entries: JsonCache = JSON.parse(buf.toString());
  const newEntries: [string, Set<string>][] = entries.map(({ key, values }) => [
    key,
    new Set(values),
  ]);

  return new Map(newEntries);
}

async function write(path: string, cache: MapCache): Promise<void> {
  // map to JSON serializable object
  const json: JsonCache = [...cache.entries()].map(([key, set]) => ({
    key: key,
    values: [...set.values()],
  }));

  // save to disk
  const jsonString = JSON.stringify(json, null, 2);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, jsonString);
}

async function hasValue(
  path: string,
  key: string,
  value: string
): Promise<boolean> {
  const cache = await read(path);
  return !!cache.get(key)?.has(value);
}

async function addValue(
  path: string,
  key: string,
  value: string
): Promise<void> {
  const cache = await read(path);

  const set = cache.get(key);
  if (set) {
    set.add(value);
  } else {
    cache.set(key, new Set([value]));
  }

  await write(path, cache);
}

async function getValues(path: string, key: string) {
  const cache = await read(path);
  return cache.get(key) || new Set();
}

async function addKeys(path: string, keys: string[]) {
  const cache = await read(path);

  keys.forEach((key) => {
    if (!cache.has(key)) {
      cache.set(key, new Set());
    }
  });

  await write(path, cache);
}

type ForEachCallback = (
  key: string,
  values: Set<string>
) => Promise<void> | void;

async function forEach(path: string, callback: ForEachCallback) {
  const cache = await read(path);

  for (const [key, values] of cache) {
    await callback(key, values);
  }
}

export interface Cache {
  // single ops
  hasValue: (key: string, value: string) => Promise<boolean>;
  addValue: (key: string, value: string) => Promise<void>;
  getValues: (key: string) => Promise<Set<string>>;

  // bulk ops
  addKeys: (keys: string[]) => Promise<void>;

  // iterate
  forEach: (callback: ForEachCallback) => Promise<void>;
}

export function createCache(path: string): Cache {
  return {
    hasValue: (key, value) => hasValue(path, key, value),
    addValue: (key, value) => addValue(path, key, value),
    getValues: (key) => getValues(path, key),
    addKeys: (keys) => addKeys(path, keys),
    forEach: (callback) => forEach(path, callback),
  };
}
