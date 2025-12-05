
'use server';

/**
 * @fileOverview A dedicated Genkit flow for generating images.
 * This flow is called by the client after the main reasoning flow decides to use this tool.
 */

import { ai } from '@/ai/init';
import { z } from 'genkit';

const ImageGenerationInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the image to generate.'),
});

// The output will be the URL of the generated image.
const ImageGenerationOutputSchema = z.object({
    imageUrl: z.string().url().describe("The data URI of the generated image.")
});


export const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: ImageGenerationInputSchema,
    outputSchema: ImageGenerationOutputSchema,
  },
  async ({ prompt }) => {
    
    // Remove technical parameters and numerical values that the image model may not understand well.
    const creativePrompt = prompt
      .replace(/com saturação de cor baixa em \d+%/gi, '')
      .replace(/contraste suave/gi, '')
      .replace(/resultando em uma imagem com qualidade visual ligeiramente baixa ou granulada/gi, '')
      .replace(/, /g, ' ')
      .trim();

    console.log(`[ImageGenerationFlow] Original prompt: "${prompt}"`);
    console.log(`[ImageGenerationFlow] Cleaned prompt for generation: "${creativePrompt}"`);

    try {
        const { media } = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: creativePrompt, // Use the cleaned prompt
        });
        
        if (!media.url) {
            throw new Error('Image generation failed, no media URL returned.');
        }

        console.log(`[ImageGenerationFlow] Image generated successfully.`);
        return { imageUrl: media.url };

    } catch (error) {
      console.error("[ImageGenerationFlow] Error:", error);
      throw new Error(`The image generation for "${prompt}" failed. Please inform the user that the image could not be created.`);
    }
  }
);
