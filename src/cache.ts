import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { constants } from 'fs';
import { dirname } from 'path';

function exists(path: string): Promise<boolean> {
  return access(path, constants.R_OK | constants.W_OK)
    .then(() => true)
    .catch(() => false);
}

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
  if (!exists(path)) return false;

  const set = await read<string>(path);
  return set.has(url);
}

async function add(path: string, url: string): Promise<void> {
  const set = exists(path) ? await read<string>(path) : new Set();

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
