
'use server';

/**
 * @fileOverview Este arquivo define um fluxo Genkit para criar o conteúdo de uma apresentação.
 *
 * - createPresentationContent - Uma função que recebe um tópico e o número de slides e gera o texto para cada um.
 * - PresentationInput - O tipo de entrada para a função createPresentationContent.
 * - PresentationOutput - O tipo de retorno, contendo o título, subtítulo e o conteúdo dos slides.
 */

import { ai } from '@/ai/init';
import { z } from 'genkit';
import { PresentationInputSchema, PresentationOutputSchema } from '@/lib/types';

export type PresentationInput = z.infer<typeof PresentationInputSchema>;
export type PresentationOutput = z.infer<typeof PresentationOutputSchema>;

// Este é o prompt que instrui a IA sobre como estruturar o conteúdo da apresentação.
const presentationContentPrompt = ai.definePrompt({
    name: 'presentationContentPrompt',
    model: 'googleai/gemini-2.5-flash-lite-preview-09-2025',
    input: { schema: PresentationInputSchema },
    output: { schema: PresentationOutputSchema },
    prompt: `Você é um especialista em criar conteúdo para apresentações de slides. Sua tarefa é pegar um tópico e gerar o conteúdo para uma apresentação.

Tópico da Apresentação: {{{topic}}}
Número de Slides de Conteúdo: {{{numSlides}}}

REGRAS:
1.  **Título e Subtítulo:** Crie um título principal impactante e um subtítulo curto e envolvente para a apresentação.
2.  **Conteúdo dos Slides:** Gere EXATAMENTE {{{numSlides}}} slides de conteúdo.
3.  **Formato do Conteúdo:** Para cada slide, forneça um título curto e 2 a 3 pontos principais em formato de bullet points (usando "-"). O conteúdo deve ser conciso e direto ao ponto.
4.  **Ícone:** Para cada slide, sugira um nome de ícone VÁLIDO da biblioteca 'lucide-react' (em formato PascalCase, ex: 'BrainCircuit', 'BarChart') que represente visualmente o conteúdo do slide.
5.  **Idioma:** TODO o conteúdo gerado DEVE ser em Português do Brasil (pt-BR).

Sua resposta DEVE ser um objeto JSON que corresponda exatamente ao schema de saída.
`,
});

const createPresentationContentFlow = ai.defineFlow(
  {
    name: 'createPresentationContentFlow',
    inputSchema: PresentationInputSchema,
    outputSchema: PresentationOutputSchema,
  },
  async (input) => {
    const { output } = await presentationContentPrompt(input);
    if (!output) {
      throw new Error("A IA não conseguiu gerar o conteúdo da apresentação.");
    }
    return output;
  }
);

export async function createPresentationContent(input: PresentationInput): Promise<PresentationOutput> {
  return createPresentationContentFlow(input);
}
