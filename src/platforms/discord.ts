import { format } from 'date-fns';
import { MessageEmbed, WebhookClient } from 'discord.js';

import { News } from '../news';
import { chunk, getEnv } from '../util';
import { Bot, NewsSendResult, Platform } from '.';

async function send(
  newsArray: News[],
  webhookId: string,
  webhookToken: string
): Promise<NewsSendResult[]> {
  const allEmbeds = newsArray.map((news) => {
    const formattedAttachments = news.attachments
      .map(
        (attachment) =>
          `:small_blue_diamond: [${attachment.name}](${attachment.url})`
      )
      .join('\n');

    const formattedDate = format(news.date, 'dd/MM/yyyy');

    const embed = new MessageEmbed()
      .setTitle(news.title)
      .setURL(news.absoluteUrl)
      .setDescription(news.text)
      .addFields(
        { name: ':link: Allegati', value: formattedAttachments },
        { name: ':ledger: Numero', value: news.id, inline: true },
        { name: ':calendar: Data', value: formattedDate, inline: true }
      );

    return { embed, news };
  });

  const webHook = new WebhookClient(webhookId, webhookToken);
  const messageStatuses: NewsSendResult[] = [];

  try {
    // FIXME: check that total embed size is not > 6000 characters
    for await (const chunks of chunk(allEmbeds, 5)) {
      const embeds = chunks.map((chunk) => chunk.embed);
      const newsList = chunks.map((chunk) => chunk.news);

      try {
        await webHook.send({ embeds });

        newsList.forEach((news) =>
          messageStatuses.push({ status: 'ok', news })
        );
      } catch (error) {
        newsList.forEach((news) =>
          messageStatuses.push({ status: 'error', error, news })
        );
      }
    }
  } finally {
    webHook.destroy();
  }

  return messageStatuses;
}

function isEnabled(): boolean {
  try {
    getEnv('DISCORD_WEBHOOK_ID');
    getEnv('DISCORD_WEBHOOK_TOKEN');
    return true;
  } catch {
    return false;
  }
}

function initialize(): Bot {
  const DISCORD_WEBHOOK_ID = getEnv('DISCORD_WEBHOOK_ID');
  const DISCORD_WEBHOOK_TOKEN = getEnv('DISCORD_WEBHOOK_TOKEN');

  return {
    platformName: 'Discord',
    send: (news) => send(news, DISCORD_WEBHOOK_ID, DISCORD_WEBHOOK_TOKEN),
  };
}

export const discordPlatform: Platform = {
  name: 'Discord',
  isEnabled,
  initialize,
};
