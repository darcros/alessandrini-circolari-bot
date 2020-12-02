import { format } from 'date-fns';
import { Telegraf } from 'telegraf';

import { Cache } from '../cache';
import { News } from '../news';
import { fixMultinePadding, getEnv } from '../util';
import { Bot, Platform } from '.';

async function send(
  news: News | News[],
  token: string,
  channelId: string,
  cache: Cache
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
    await cache.addValue(news.url, telegramPlatform.name);
  }
}

function isEnabled(): boolean {
  try {
    getEnv('TELEGRAM_TOKEN');
    getEnv('TELEGRAM_CHANNEL_ID');
    return true;
  } catch {
    return false;
  }
}

function initialize(cache: Cache): Bot {
  const TELEGRAM_TOKEN = getEnv('TELEGRAM_TOKEN');
  const TELEGRAM_CHANNEL_ID = getEnv('TELEGRAM_CHANNEL_ID');

  return {
    platformName: 'Telegram',
    send: (news: News | News[]) =>
      send(news, TELEGRAM_TOKEN, TELEGRAM_CHANNEL_ID, cache),
  };
}

export const telegramPlatform: Platform = {
  name: 'Telegram',
  isEnabled,
  initialize,
};
