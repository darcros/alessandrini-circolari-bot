import { format } from 'date-fns';
import { Telegraf } from 'telegraf';

import { UrlCache } from '../cache';
import { News } from '../news';
import { fixMultinePadding } from '../util';
import { Bot } from './bot';

async function send(
  news: News | News[],
  token: string,
  channelId: string,
  cache: UrlCache
) {
  const newsArray = Array.isArray(news) ? news : [news];
  const bot = new Telegraf(token);

  for (const news of newsArray) {
    const message = `
      *📄 Circolare*
      [${news.title}](${news.absoluteUrl})

      📒 Numero: ${news.id}
      📆 Data: ${format(news.date, 'dd/MM/yyyy')}

      ${news.text}

      ${news.attachments.length > 0 ? '🔗 Allegati' : ''}
      ${news.attachments
        .map((attachment) => `▪️[${attachment.name}](${attachment.url})`)
        .join('\n')}
    `;

    await bot.telegram.sendMessage(channelId, fixMultinePadding(message), {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    });
    await cache.add(news.url);
  }
}

export function createTelegramBot(
  token: string,
  channelId: string,
  cache: UrlCache
): Bot {
  return {
    send: (news: News | News[]) => send(news, token, channelId, cache),
  };
}
