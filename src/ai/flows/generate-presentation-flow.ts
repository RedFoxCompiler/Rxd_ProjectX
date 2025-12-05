
'use server';

/**
 * @fileOverview Fluxo de IA que atua como um "Layout e Style Engine" com foco em design "aesthetic".
 * Recebe um tópico e um número de slides, e usa uma lista de CONCEITOS de layout pré-definidos
 * para gerar uma estrutura JSON detalhada. A IA é responsável por:
 * 1. Escolher um par de fontes e uma paleta de cores suaves/estéticas.
 * 2. Selecionar o layout mais apropriado para cada slide.
 * 3. Preencher o conteúdo (títulos, textos).
 * 4. Decidir se usa uma imagem de fundo ou uma cor sólida, favorecendo o minimalismo.
 * 5. Gerar as coordenadas e estilos para cada elemento, criando uma composição harmoniosa.
 */

import { ai } from '@/ai/init';
import { z } from 'genkit';
import { PRESET_LAYOUTS } from '@/lib/presentation-layouts';

// --- Schemas de Entrada e Saída ---

const PresentationInputSchema = z.object({
  topic: z.string().describe('O tópico principal sobre o qual a apresentação deve ser criada.'),
  numSlides: z.number().min(2).max(17).describe('O número de slides de CONTEÚDO (excluindo o slide de título). O máximo é 17 para um total de 18 slides.'),
});

const ElementSchema = z.object({
  kind: z.string().describe("O tipo de elemento (ex: 'title', 'body', 'background_image')."),
  text: z.string().optional().describe("O conteúdo textual do elemento."),
  x: z.number().describe("Coordenada X em pixels."),
  y: z.number().describe("Coordenada Y em pixels."),
  w: z.number().describe("Largura em pixels."),
  h: z.number().describe("Altura em pixels."),
  fontFace: z.string().optional().describe("A fonte a ser usada."),
  fontSize: z.number().optional().describe("O tamanho da fonte em pontos (pt)."),
  align: z.string().optional().describe("Alinhamento do texto ('left', 'center', 'right')."),
  color: z.string().optional().describe("Cor do texto em formato hexadecimal."),
  bold: z.boolean().optional().describe("Se o texto está em negrito."),
  overlay: z.object({
      color: z.string(),
      opacity: z.number(),
  }).optional().describe("Sobreposição de cor para imagens de fundo."),
});

const SlideLayoutSchema = z.object({
  index: z.number(),
  layout_name: z.string().describe("O nome do conceito de layout usado como base."),
  backgroundColor: z.string().optional().describe("Cor de fundo para este slide (hex, ex: #F5E9E2). Usar se não houver imagem."),
  image_query: z.string().optional().describe("Um termo de busca em INGLÊS para a API Pixabay. Use com moderação, favorecendo slides limpos."),
  icon_name: z.string().optional().describe("Um nome de ícone VÁLIDO de 'lucide-react' (PascalCase) que represente o conteúdo."),
  elements: z.array(ElementSchema),
});

const FontPairSchema = z.object({
    titleFont: z.string().describe("Fonte para todos os títulos."),
    bodyFont: z.string().describe("Fonte para todo o corpo de texto e subtítulos."),
});

const ColorPaletteSchema = z.object({
    background: z.string().describe("Cor de fundo principal (hex). Deve ser suave e clara (ex: #F5E9E2)."),
    text: z.string().describe("Cor do texto principal (hex). Deve ter bom contraste com o fundo (ex: #5C3D46)."),
    accent: z.string().describe("Cor de destaque para ícones ou detalhes (hex). Deve ser harmoniosa."),
});

const LayoutOutputSchema = z.object({
  presentation_title: z.string().describe('O título principal e impactante da apresentação.'),
  fontPair: FontPairSchema,
  colorPalette: ColorPaletteSchema,
  slides: z.array(SlideLayoutSchema).describe('A lista de slides preenchidos. O tamanho do array deve ser numSlides + 1 (para o slide de título).'),
});

export type PresentationLayout = z.infer<typeof LayoutOutputSchema>;

// --- Prompt para o Layout & Style Engine ---

const layoutEnginePrompt = ai.definePrompt({
    name: 'layoutEnginePrompt',
    model: 'googleai/gemini-2.5-flash-lite-preview-09-2025',
    input: { schema: z.object({
        topic: z.string(),
        numSlides: z.number(),
        presets: z.string(),
        fontOptions: z.string(),
    })},
    output: { schema: LayoutOutputSchema },
    prompt: `Você é um designer de apresentações com um estilo "minimalist aesthetic". Sua missão é criar um layout JSON para uma apresentação, priorizando a beleza, a simplicidade e a legibilidade.

REGRAS DE OURO:
1.  **SAÍDA ESTRITA:** Sua resposta DEVE ser um objeto JSON válido que corresponda EXATAMENTE ao 'LayoutOutputSchema'. NENHUM texto ou markdown fora do JSON.
2.  **ESTILO PRIMEIRO - CORES E FONTES:**
    *   **Paleta de Cores:** Crie uma 'colorPalette' com 3 cores HARMONIOSAS e SUAVES (background, text, accent) em formato hexadecimal. Pense em tons pastéis, terrosos e orgânicos (ex: rosa pálido, marrom suave, bege).
    *   **Par de Fontes:** Escolha UMA combinação de fontes da lista '{{{fontOptions}}}' que seja ELEGANTE e MODERNA. Preencha 'titleFont' e 'bodyFont'.
3.  **COMPOSIÇÃO DOS SLIDES:**
    *   Gere exatamente {{{numSlides}}} + 1 slides.
    *   Para cada slide, escolha um CONCEITO de layout da lista '{{{presets}}}'.
    *   **Minimalismo é a chave:** DECIDA se o slide ficará melhor com uma 'image_query' ou com um 'backgroundColor' sólido da sua paleta. A maioria dos slides deve focar em tipografia e cor, sem imagem. Use 'image_query' apenas para slides que realmente precisam de um apelo visual fotográfico (ex: slide de título, talvez um ou dois no meio).
    *   Preencha os placeholders (ex: {TITLE}) com conteúdo relevante ao '{{{topic}}}' em Português do Brasil. Títulos de slides devem estar em MAIÚSCULAS.
4.  **REGRAS DE LAYOUT E COORDENADAS:**
    *   Para cada elemento, você DEVE preencher os campos de estilo ('fontFace', 'color', 'fontSize', 'bold') e as coordenadas ('x', 'y', 'w', 'h').
    *   Use as coordenadas e tamanhos dos presets como uma GUIA, mas sinta-se livre para ajustá-los para criar um layout mais harmonioso e com bom espaçamento ("negative space").
    *   Garanta que a cor de fundo de cada slide ('backgroundColor') e as cores dos textos ('color') venham da paleta que você criou.

Abaixo estão os conceitos de layout para sua inspiração.
{{{presets}}}

Abaixo estão as opções de pares de fontes que você DEVE usar.
{{{fontOptions}}}

Agora, gere o JSON de layout e estilo para uma apresentação "minimalist aesthetic" sobre '{{{topic}}}' com {{{numSlides}}} slides de conteúdo.
`,
});

// --- Fluxo Principal ---

const FONT_OPTIONS = [
    { titleFont: "Lato", bodyFont: "Lora" },
    { titleFont: "Montserrat", bodyFont: "Merriweather" },
    { titleFont: "Raleway", bodyFont: "Roboto Slab" },
    { titleFont: "Oswald", bodyFont: "Georgia" },
    { titleFont: "Playfair Display", bodyFont: "Lato" },
];


const generatePresentationLayoutFlow = ai.defineFlow(
  {
    name: 'generatePresentationLayoutFlow',
    inputSchema: PresentationInputSchema,
    outputSchema: LayoutOutputSchema,
  },
  async ({ topic, numSlides }) => {

    const presetsString = JSON.stringify(PRESET_LAYOUTS, null, 2);
    const fontOptionsString = JSON.stringify(FONT_OPTIONS, null, 2);

    const { output } = await layoutEnginePrompt({ topic, numSlides, presets: presetsString, fontOptions: fontOptionsString });
    if (!output) {
      throw new Error("A IA não conseguiu gerar o layout da apresentação.");
    }

    return output;
  }
);


export async function generatePresentationLayout(input: z.infer<typeof PresentationInputSchema>): Promise<PresentationLayout> {
  return generatePresentationLayoutFlow(input);
}
