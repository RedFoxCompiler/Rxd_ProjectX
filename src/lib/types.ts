import { z } from 'zod';

// --- Schemas e Tipos para Geração de Slides ---
export const SlideSchema = z.object({
  title: z.string().describe('O título conciso e direto para este slide.'),
  content: z.string().describe('O conteúdo principal do slide, em 2 ou 3 bullets curtos e objetivos. Use a sintaxe de markdown para bullets (ex: "- Item 1").'),
  iconName: z.string().optional().describe("Um nome de ícone válido da biblioteca 'lucide-react' (em PascalCase, ex: 'BrainCircuit') que represente o conteúdo do slide."),
});

export const PresentationOutputSchema = z.object({
  title: z.string().describe('O título principal e impactante da apresentação.'),
  subtitle: z.string().describe('Um subtítulo curto e envolvente para a apresentação.'),
  slides: z.array(SlideSchema).describe('Uma lista de slides. O comprimento deste array DEVE ser exatamente igual ao número de slides de conteúdo solicitado no input.'),
});

export const PresentationInputSchema = z.object({
  topic: z.string().describe('O tópico principal sobre o qual a apresentação deve ser criada.'),
  numSlides: z.number().min(2).max(14).describe('O número de slides de CONTEÚDO (excluindo o slide de título).'),
});

export type PresentationData = z.infer<typeof PresentationOutputSchema>;
export type SlideData = z.infer<typeof SlideSchema>;
