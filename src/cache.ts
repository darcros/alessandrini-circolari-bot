import { PersistentSetContainer } from "./persistentSetContainer";

const CACHE_PATH = './data/cache.json';

const urlSet = new PersistentSetContainer<string>(CACHE_PATH);

export async function wasSent(url: string) {
  const set = await urlSet.get();
  return set.has(url);
}

export async function confirmSent(url: string) {
  const set = await urlSet.get();
  set.add(url);
  await urlSet.save();
}
