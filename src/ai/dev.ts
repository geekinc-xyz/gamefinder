import { config } from 'dotenv';
config();

import '@/ai/flows/aggregate-game-prices.ts';
import '@/ai/flows/find-games.ts';
import '@/ai/flows/chat.ts';
