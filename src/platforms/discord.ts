import { format } from 'date-fns';
import { MessageEmbed, WebhookClient } from 'discord.js';

import { UrlCache } from '../cache';
import { News } from '../news';
import { chunk } from '../util';
import { Bot } from './bot';

async function send(
  news: News | News[],
  webhookId: string,
  webhookToken: string,
  cache: UrlCache
) {
  const newsArray = Array.isArray(news) ? news : [news];

  const allEmbeds = newsArray.map((news) => {
    const formattedAttachments = news.attachments
      .map(
        (attachment) =>
          `:small_blue_diamond: [${attachment.name}](${attachment.url})`
      )
      .join('\n');

    const formattedDate = format(news.date, 'dd/MM/yyyy');

    return new MessageEmbed()
      .setTitle(news.title)
      .setURL(news.absoluteUrl)
      .setDescription(news.text)
      .addFields(
        { name: ':link: Allegati', value: formattedAttachments },
        { name: ':ledger: Numero', value: news.id, inline: true },
        { name: ':calendar: data', value: formattedDate, inline: true }
      );
  });

  const webHook = new WebhookClient(webhookId, webhookToken);
  for await (const embeds of chunk(allEmbeds, 10)) {
    await webHook.send({ embeds });
  }
  webHook.destroy();

  await Promise.all(newsArray.map((news) => cache.add(news.url)));
}

export function createDiscordBot(
  webhookId: string,
  webhookToken: string,
  cache: UrlCache
): Bot {
  return {
    send: (news: News | News[]) => send(news, webhookId, webhookToken, cache),
  };
}
