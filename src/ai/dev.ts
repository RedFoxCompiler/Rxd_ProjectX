
'use server';
import { config } from 'dotenv';
config();

// Pre-load all flows to make them available for development tools like the Genkit inspector.
import '@/ai/init';
import '@/ai/flows/generate-conversation-starter';
import '@/ai/flows/multi-step-reasoning-flow';
import '@/ai/flows/create-presentation-flow';
import '@/ai/flows/generate-presentation-flow';
import '@/ai/flows/generate-image-flow';
import '@/ai/flows/generate-video-flow';
import '@/ai/tools/calculator-tool';
import '@/ai/tools/image-generation-tool';
import '@/ai/tools/video-generation-tool';
import '@/ai/tools/web-search-tool';
