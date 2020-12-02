export function fixMultinePadding(s: string): string {
  return s
    .split('\n')
    .map((s) => s.trim())
    .join('\n');
}

export function getEnv(name: string, def?: string): string {
  const envVar = process.env[name];

  if (envVar) return envVar;

  if (def) return def;

  const message = `
    VARIBILI D'AMBIENTE MANCANTI!
    Questa variabile d'ambiente non è stata settata: ${name}.
    Puoi settarla in due modi:
    1. crea un file chiamato .env nella stessa cartella di package.json e aggiungi questa riga "${name}=valore"
    2. settala tramite il tuo sistema operativo (con bash, CMD, ecc..)
  `;

  throw new Error(fixMultinePadding(message));
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    const chunk = arr.slice(i, i + size);
    chunks.push(chunk);
  }

  return chunks;
}

export function toMap<T, K extends string>(
  arr: T[],
  getKey: (element: T) => K
): Map<K, T> {
  const map: Map<K, T> = new Map();

  arr.forEach((element) => {
    const k = getKey(element);
    map.set(k, element);
  });

  return map;
}

export function mapObject<T, U>(
  object: Record<string, T>,
  mapper: (x: T) => U
): Record<string, U> {
  const entries = Object.entries(object).map(([key, value]) => [
    key,
    mapper(value),
  ]);
  return Object.fromEntries(entries);
}

export async function allSuccessfull<T>(promises: Promise<T>[]): Promise<T[]> {
  const settled = await Promise.allSettled(promises);
  return settled.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : []
  );
}
