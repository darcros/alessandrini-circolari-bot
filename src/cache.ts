import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { constants } from 'fs';
import { dirname } from 'path';
import { getEnv } from './util';

const CACHE_PATH = getEnv('CACHE_PATH', './data/cache.json');

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

export async function wasSent(url: string): Promise<boolean> {
  if (!exists(CACHE_PATH)) return false;

  const set = await read<string>(CACHE_PATH);
  return set.has(url);
}

export async function confirmSent(url: string): Promise<void> {
  const set = exists(CACHE_PATH) ? await read<string>(CACHE_PATH) : new Set();

  set.add(url);
  await write(CACHE_PATH, set);
}
