export function fixMultinePadding(s: string) {
  return s.split('\n')
    .map(s => s.trim())
    .join('\n');
}

export function requireEnv(name: string) {
  const envVar = process.env[name];

  if (!envVar) {
    const message = `
      VARIBILI D'AMBIENTE MANCANTI!
      Questa variabile d'ambiente non è stata settata: ${name}.
      Puoi settarla in due modi:
      1. crea un file chiamato .env nella stessa cartella di package.json e aggiungi questa riga "${name}=valore"
      2. settala tramite il tuo sistema operativo (con bash, CMD, ecc..)
    `;

    throw new Error(fixMultinePadding(message));
  }

  return envVar;
}
