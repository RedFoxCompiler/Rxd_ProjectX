
'use server';

import { ai } from '@/ai/init';
import { z } from 'genkit';

const ImageGenerationInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the image to generate.'),
});

// The output will be the URL of the generated image.
const ImageGenerationOutputSchema = z.object({
    imageUrl: z.string().url().describe("The data URI of the generated image.")
});


export const generateImageTool = ai.defineTool(
  {
    name: 'generateImageTool',
    description: 'Generates an image from a text description. Use this when the user asks to create, draw, or generate an image.',
    input: { schema: ImageGenerationInputSchema },
    output: { schema: ImageGenerationOutputSchema },
  },
  async ({ prompt }) => {
    
    // Remove technical parameters and numerical values that the image model may not understand well.
    const creativePrompt = prompt
      .replace(/com saturação de cor baixa em \d+%/gi, '')
      .replace(/contraste suave/gi, '')
      .replace(/resultando em uma imagem com qualidade visual ligeiramente baixa ou granulada/gi, '')
      .replace(/, /g, ' ')
      .trim();

    console.log(`[ImageGenerationTool] Original prompt: "${prompt}"`);
    console.log(`[ImageGenerationTool] Cleaned prompt for generation: "${creativePrompt}"`);

    try {
        const { media } = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: creativePrompt, // Use the cleaned prompt
            config: {
                // Configuration for dimensions or other parameters can be added here if supported.
            }
        });
        
        if (!media.url) {
            throw new Error('Image generation failed, no media URL returned.');
        }

        console.log(`[ImageGenerationTool] Image generated successfully.`);
        return { imageUrl: media.url };

    } catch (error) {
      console.error("[ImageGenerationTool] Error:", error);
      throw new Error(`The image generation for "${prompt}" failed. Please inform the user that the image could not be created.`);
    }
  }
);
