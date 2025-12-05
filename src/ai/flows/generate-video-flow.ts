
'use server';

/**
 * @fileOverview A dedicated Genkit flow for generating videos.
 * This flow is called by the client after the main reasoning flow decides to use this tool.
 */

import { ai } from '@/ai/init';
import { z } from 'genkit';
import { MediaPart } from 'genkit/content';

const VideoGenerationInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the video to generate.'),
});

const VideoGenerationOutputSchema = z.object({
    videoUrl: z.string().url().describe("The data URI of the generated video.")
});

async function downloadMedia(video: MediaPart): Promise<string> {
  const fetch = (await import('node-fetch')).default;
  
  if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  
  const videoDownloadResponse = await fetch(
    `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`
  );

  if (!videoDownloadResponse.ok || !videoDownloadResponse.body) {
    throw new Error(`Failed to fetch video: ${videoDownloadResponse.statusText}`);
  }

  const videoBuffer = await videoDownloadResponse.arrayBuffer();
  const base64Video = Buffer.from(videoBuffer).toString('base64');
  
  const contentType = video.media?.contentType || 'video/mp4';

  return `data:${contentType};base64,${base64Video}`;
}


export const generateVideoFlow = ai.defineFlow(
  {
    name: 'generateVideoFlow',
    inputSchema: VideoGenerationInputSchema,
    outputSchema: VideoGenerationOutputSchema,
  },
  async ({ prompt }) => {
    const enhancedPrompt = `${prompt}, in real camera quality, with low contrast and minimal motion blur, cinematic style.`;
    console.log(`[VideoGenerationFlow] Generating video for prompt: "${enhancedPrompt}"`);

    try {
        let { operation } = await ai.generate({
            model: 'googleai/veo-3.0-generate-preview',
            prompt: enhancedPrompt,
            config: {
                aspectRatio: '16:9',
            },
        });
        
        if (!operation) {
            throw new Error('Video generation did not return an operation.');
        }

        // Poll for completion
        while (!operation.done) {
            console.log('[VideoGenerationFlow] Checking operation status...');
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
            operation = await ai.checkOperation(operation);
        }

        if (operation.error) {
            throw new Error(`Video generation failed: ${operation.error.message}`);
        }

        const video = operation.output?.message?.content.find((p) => !!p.media);
        if (!video) {
            throw new Error('Failed to find the generated video in the operation output.');
        }
        
        console.log('[VideoGenerationFlow] Video generated, now downloading and converting to Data URI...');
        const videoDataUri = await downloadMedia(video);
        
        console.log(`[VideoGenerationFlow] Video generation successful.`);
        return { videoUrl: videoDataUri };

    } catch (error) {
      console.error("[VideoGenerationFlow] Error:", error);
      throw new Error(`The video generation for "${prompt}" failed.`);
    }
  }
);
