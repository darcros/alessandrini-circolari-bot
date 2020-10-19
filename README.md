# Alessandrini circolari bot

Questo bot scarica le ultime circolari dal sito dell' IIS Alessandrini di Vittuone e poi le invia su un canale Telegram.

## Installazione

1. Node.js (con npm) deve essere già installato.
2. Clonare questo repo.
3. Eseguire `npm install` dentro al repo clonato.

## Funzionamento

Quando il bot viene avviato con `npm start` scaricherà la lista di circolari dal sito, le invierà sul canale Telegram che è stato configurato e poi terminerà.
Il bot è stato scritto come uno script che viene eseguto una volta e poi termina, quindi per controllare se ci nuove circolari bisogna invocarlo ad intervalli periodici utilizzando `cron` o simili.
Le circolari già inviate vengono salvate in una cache (in `./data/cache.json`) e non verrano inviate nuovamente al prossimo avvio.

## Configuazione

Il bot viene configurato tramite variabili d'ambiente.
Se all'avvio il bot trova un file `.env` nella cartella principale (la stessa di `package.json`) leggerà le variabili d'ambiente da lì. Le variabil nel `.env` hanno la precedenza su quelle del sistema.

| Variabile d'ambiente | Descrizione                                    |
| -------------------- | ---------------------------------------------- |
| TELEGRAM_TOKEN       | Il token dell'API di Telegram                  |
| TELEGRAM_CHANNEL_ID  | ID del canale Telegram dove mandare i messaggi |
| BASE_URL             | L'url della pagina delle circolari             |
