
'use server';

import { ai } from '@/ai/init';
import { z } from 'genkit';
import { HTMLElement, parse } from 'node-html-parser';

const WebSearchInputSchema = z.object({
  query: z.string().describe('The search query for the web search. This should be a concise keyword or question.'),
});

const WebSearchOutputSchema = z.object({
  results: z.array(z.object({
    title: z.string(),
    link: z.string().url(),
    snippet: z.string(),
  })).describe("A list of search results, including title, link, and a snippet of the content."),
  fullText: z.string().describe("A consolidated summary of the most relevant information found across the search results."),
});


// Helper function to extract relevant text from an HTML node (specifically for Wikipedia)
function extractTextFromNode(node: HTMLElement): string {
    if (node.nodeType === 3) return node.textContent; // Text node
    if (node.nodeType !== 1) return ''; // Not an element node

    // List of selectors for non-content sections to be removed from Wikipedia articles
    const selectorsToRemove = [
        'script', 'style', 'nav', 'footer', 'header', '.mw-editsection', 
        '.infobox', '.thumb', '.mw-jump-link', '.toc', '.reflist', 'table'
    ];

    if (selectorsToRemove.some(selector => node.matches(selector))) {
        return '';
    }

    let text = '';
    for (const child of node.childNodes) {
        text += extractTextFromNode(child as HTMLElement) + ' ';
    }
    return text;
}


/**
 * This tool performs a REAL web search using Wikipedia and scrapes the results.
 * It fetches the content and provides a text summary to the AI.
 */
export const searchWebTool = ai.defineTool(
  {
    name: 'searchWebTool',
    description: 'Searches Wikipedia for information on a given query. Use this for current events, facts, or data not in your training set.',
    input: { schema: WebSearchInputSchema },
    output: { schema: WebSearchOutputSchema },
  },
  async ({ query }) => {
    console.log(`[WebSearchTool] Performing Wikipedia search for: "${query}"`);

    if (!query || typeof query !== 'string' || !query.trim()) {
      return {
        results: [],
        fullText: "A busca falhou porque nenhum termo de pesquisa foi fornecido."
      };
    }

    try {
        // Use Wikipedia's API for a more reliable search and direct article access
        const searchApiUrl = `https://pt.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json`;
        
        const searchResponse = await fetch(searchApiUrl, {
            headers: { 'User-Agent': 'NyxAI/1.0 (Contact: user@example.com)' }
        });

        if (!searchResponse.ok) {
            throw new Error(`A busca na API da Wikipedia falhou com o status: ${searchResponse.status}`);
        }

        const searchResult = await searchResponse.json();
        const pageTitle = searchResult[1][0];
        const pageUrl = searchResult[3][0];

        if (!pageTitle || !pageUrl) {
            return {
                results: [],
                fullText: `A busca por "${query}" na Wikipedia não retornou um artigo direto. Tente um termo de busca diferente ou mais geral.`
            };
        }

        // Fetch the content of the article found
        const articleResponse = await fetch(pageUrl, {
             headers: { 'User-Agent': 'NyxAI/1.0 (Contact: user@example.com)' }
        });

        if (!articleResponse.ok) {
            throw new Error(`A busca no artigo da Wikipedia falhou com o status: ${articleResponse.status}`);
        }

        const html = await articleResponse.text();
        const root = parse(html);
        const mainContentNode = root.querySelector('#mw-content-text .mw-parser-output');
        
        let fullText = "Nenhum conteúdo principal encontrado no artigo.";
        if (mainContentNode) {
            fullText = extractTextFromNode(mainContentNode)
                        .replace(/\s\s+/g, ' ') // Remove extra whitespace
                        .trim()
                        .substring(0, 5000); // Limit to a reasonable length for the AI
        }

        return {
            results: [{
                title: pageTitle,
                link: pageUrl,
                snippet: fullText.substring(0, 300) + '...'
            }],
            fullText: `Resumo do artigo da Wikipedia para "${query}":\n\n` + fullText
        };

    } catch (error) {
        console.error("[WebSearchTool] Error:", error);
        return {
            results: [],
            fullText: `Ocorreu um erro ao tentar buscar na Wikipedia: ${(error as Error).message}. Informe ao usuário que a busca falhou.`
        };
    }
  }
);
