import { News } from '../news';
import { discordPlatform } from './discord';
import { telegramPlatform } from './telegram';

export type NewsSendResult =
  | { status: 'ok'; news: News }
  | { status: 'error'; error: unknown; news: News };

export interface Bot {
  readonly platformName: string;

  send(news: News[]): Promise<NewsSendResult[]>;
}

export interface Platform {
  readonly name: string;

  isEnabled: () => boolean;
  initialize: () => Bot;
}

const platforms = [telegramPlatform, discordPlatform];

export function getEnabledBots(): Bot[] {
  return platforms
    .filter((platform) => {
      const enabled = platform.isEnabled();
      if (!enabled) {
        console.info(`La piattaforma ${platform.name} è disabilitata`);
      }

      return enabled;
    })
    .map((platform) => platform.initialize());
}
