# Alessandrini circolari bot

Questo bot scarica le ultime circolari dal sito dell' IIS Alessandrini di Vittuone e poi le invia su diverse piattaforme come canali Telegram o Discord.

## Installazione

1. Node.js (con npm) deve essere già installato.
2. Clonare questo repo.
3. Eseguire `npm install` dentro al repo clonato.

## Funzionamento

Quando il bot viene avviato con `npm start` scaricherà la lista di circolari dal sito, le invierà sulle piattaforme che sono state configurate e poi terminerà.
Il bot è stato scritto come uno script che viene eseguto una volta e poi termina, quindi per controllare se ci nuove circolari bisogna invocarlo ad intervalli periodici utilizzando `cron` o simili.
Le circolari già inviate vengono salvate in una cache (in `./data/cache.json`) e non verrano inviate nuovamente al prossimo avvio.

## Configuazione

Il bot viene configurato tramite variabili d'ambiente.
Se all'avvio il bot trova un file `.env` nella cartella principale (la stessa di `package.json`) leggerà le variabili d'ambiente da lì. Le variabil nel `.env` hanno la precedenza su quelle del sistema.

| variabile d'ambiente  | descrizione                                           | default                                                       |
| --------------------- | ----------------------------------------------------- | ------------------------------------------------------------- |
| TELEGRAM_TOKEN        | Il token dell'API di Telegram                         | **Se assente disabilita la piattaforma Telegram**             |
| TELEGRAM_CHANNEL_ID   | ID del canale Telegram dove mandare i messaggi        | **Se assente disabilita la piattaforma Telegram**             |
| DISCORD_WEBHOOK_ID    | ID del webhook di Discord (prima parte dell'url)      | **Se assente disabilita la piattaforma Discord**              |
| DISCORD_WEBHOOK_TOKEN | Token del webhook di Discord (seconda parte dell'url) | **Se assente disabilita la piattaforma Discord**              |
| BASE_URL              | L'url della pagina delle circolari                    | <https://www.alessandrinimainardi.edu.it/categoria/circolari> |
| CACHE_PATH            | Il percorso nel quale salvare il file di cache        | `./data/cache.json`                                           |
