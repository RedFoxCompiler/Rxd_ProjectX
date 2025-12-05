
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a title for a chat conversation.
 *
 * - generateChatTitleFlow - A function that takes a short conversation history and returns a concise title.
 */

import {ai} from '@/ai/init';
import {z} from 'genkit';

const ChatHistoryItemSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatTitleInputSchema = z.object({
  history: z.array(ChatHistoryItemSchema).describe('The first few messages of the conversation.'),
});
export type ChatTitleInput = z.infer<typeof ChatTitleInputSchema>;


const ChatTitleOutputSchema = z.object({
  title: z.string().describe('A short, descriptive title for the conversation, no more than 5 words.'),
});
export type ChatTitleOutput = z.infer<typeof ChatTitleOutputSchema>;


export async function generateChatTitleFlow(
  input: ChatTitleInput
): Promise<ChatTitleOutput> {

  const historyText = input.history.map(m => `${m.role}: ${m.content}`).join('\n');

  const prompt = ai.definePrompt({
    name: 'chatTitlePrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    output: { schema: ChatTitleOutputSchema },
    prompt: `Analyze the following conversation snippet and create a concise, descriptive title for it. The title should be in Brazilian Portuguese (pt-BR) and must not exceed 5 words.

Conversation:
${historyText}

Based on the conversation, what is a suitable title?`,
  });

  const { output } = await prompt({});
  if (!output) {
      throw new Error("Could not generate chat title.");
  }
  return output;
}
