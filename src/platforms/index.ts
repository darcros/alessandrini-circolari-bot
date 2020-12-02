import { Cache } from '../cache';
import { News } from '../news';
import { discordPlatform } from './discord';
import { telegramPlatform } from './telegram';

export interface Bot {
  readonly platformName: string;

  send(news: News[]): Promise<void>;
  send(news: News): Promise<void>;
}

export interface Platform {
  readonly name: string;

  isEnabled: () => boolean;
  initialize: (cache: Cache) => Bot;
}

const platforms = [telegramPlatform, discordPlatform];

export function getEnabledBots(cache: Cache): Bot[] {
  return platforms
    .filter((platform) => {
      const enabled = platform.isEnabled();
      if (!enabled) {
        console.info(`La piattaforma ${platform.name} è disabilitata`);
      }

      return enabled;
    })
    .map((platform) => platform.initialize(cache));
}
