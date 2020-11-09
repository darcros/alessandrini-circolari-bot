import { News } from '../news';

// interfaccia Bot che tutte le piattaforme devono implementare
export interface Bot {
  send(news: News[]): Promise<void>;
  send(news: News): Promise<void>;
}
