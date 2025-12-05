
/**
 * @fileoverview This file initializes the Genkit AI instance with a single API key from environment variables.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// The .env file is now loaded by next.config.ts, so we don't need to call config() here.
// This ensures that process.env.GEMINI_API_KEY is available reliably.

// Initialize Genkit with the Google AI plugin, configuring it to use the single API key from .env.
// This ensures all AI calls use the same key.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});
