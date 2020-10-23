import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

async function read<T>(path: string): Promise<Set<T>> {
  const buf = await readFile(path);
  const arr = JSON.parse(buf.toString());
  return new Set(arr);
}

async function write<T>(path: string, set: Set<T>): Promise<void> {
  const urls = [...set.values()];
  const jsonString = JSON.stringify(urls, null, 2);

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, jsonString);
}

async function isPresent(path: string, url: string): Promise<boolean> {
  try {
    const set = await read<string>(path);
    return set.has(url);
  } catch (_) {
    return false;
  }
}

async function add(path: string, url: string): Promise<void> {
  const set = await read<string>(path).catch(() => new Set<string>());

  set.add(url);
  await write(path, set);
}

export interface UrlCache {
  isPresent: (url: string) => Promise<boolean>;
  add: (url: string) => Promise<void>;
}

export function createCache(path: string): UrlCache {
  return {
    isPresent: (url: string) => isPresent(path, url),
    add: (url: string) => add(path, url),
  };
}
