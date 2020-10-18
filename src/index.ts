import * as dotenv from 'dotenv';
import { Telegraf } from "telegraf";
import { requireEnv } from './util';

// Carica variabili d'ambiente da .env
dotenv.config();

const bot = new Telegraf(requireEnv('TELEGRAM_TOKEN'));

bot.start(ctx => ctx.reply('Bot avviato!'));
bot.command('hello', ctx => ctx.reply('world'));

bot.launch()
  .then(() => console.info('bot connesso'));
