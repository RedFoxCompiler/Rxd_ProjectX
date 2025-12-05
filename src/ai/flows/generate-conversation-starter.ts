
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating conversation starters.
 *
 * - generateConversationStarter - A function that returns a suggested conversation starter.
 * - ConversationStarterInput - The input type for the generateConversationStarter function (currently empty).
 * - ConversationStarterOutput - The return type for the generateConversationStarter function, containing the starter.
 */

import {ai} from '@/ai/init';
import {z} from 'genkit';

const ConversationStarterInputSchema = z.object({});
export type ConversationStarterInput = z.infer<typeof ConversationStarterInputSchema>;

const ConversationStarterOutputSchema = z.object({
  starter: z.string().describe('A suggested conversation starter or prompt.'),
});
export type ConversationStarterOutput = z.infer<typeof ConversationStarterOutputSchema>;

export async function generateConversationStarter(
  input: ConversationStarterInput
): Promise<ConversationStarterOutput> {
  return generateConversationStarterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversationStarterPrompt',
  model: 'googleai/gemini-2.5-flash-lite-preview-09-2025',
  input: {schema: ConversationStarterInputSchema},
  output: {schema: ConversationStarterOutputSchema},
  prompt: `You are a helpful AI assistant. Suggest a single, engaging conversation starter or prompt for a new user who is unfamiliar with your capabilities. The goal is to encourage interaction and demonstrate what you can do. Return only the conversation starter, and it MUST be in Brazilian Portuguese (pt-BR).`,
});

const generateConversationStarterFlow = ai.defineFlow(
  {
    name: 'generateConversationStarterFlow',
    inputSchema: ConversationStarterInputSchema,
    outputSchema: ConversationStarterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
