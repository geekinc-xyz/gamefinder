import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Instance principale avec la clé API par défaut (pour les modèles Pro)
export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
});

// Instance dédiée pour le modèle Flash avec sa propre clé API
export const aiFlash = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY_FLASH})],
});
