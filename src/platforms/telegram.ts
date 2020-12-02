import { format } from 'date-fns';
import { Telegraf } from 'telegraf';

import { News } from '../news';
import { fixMultinePadding, getEnv } from '../util';
import { Bot, NewsSendResult, Platform } from '.';

async function send(
  newsArray: News[],
  token: string,
  channelId: string
): Promise<NewsSendResult[]> {
  const bot = new Telegraf(token);
  const messageStatuses: NewsSendResult[] = [];

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

    try {
      await bot.telegram.sendMessage(channelId, fixMultinePadding(message), {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });

      messageStatuses.push({ status: 'ok', news });
    } catch (error) {
      messageStatuses.push({ status: 'error', error, news });
    }
  }

  return messageStatuses;
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

function initialize(): Bot {
  const TELEGRAM_TOKEN = getEnv('TELEGRAM_TOKEN');
  const TELEGRAM_CHANNEL_ID = getEnv('TELEGRAM_CHANNEL_ID');

  return {
    platformName: 'Telegram',
    send: (news) => send(news, TELEGRAM_TOKEN, TELEGRAM_CHANNEL_ID),
  };
}

export const telegramPlatform: Platform = {
  name: 'Telegram',
  isEnabled,
  initialize,
};
