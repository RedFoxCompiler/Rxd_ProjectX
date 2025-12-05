
'use client';

import React, { useState, useCallback } from 'react';
import { Wand2, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generatePresentationLayout, PresentationLayout } from '@/ai/flows/generate-presentation-flow';
import { useToast } from '@/hooks/use-toast';
import PptxGenJS from 'pptxgenjs';
import { ChatView } from '@/components/slide-generator/chat-view';
import * as LucideIcons from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cn } from '@/lib/utils';
import { colorSettings } from './color-settings';


// --- Tipos e Interfaces ---
export type ChatMessage = {
  id: number;
  role: 'user' | 'ai' | 'system';
  content: string;
  isHidden?: boolean;
};

export type GenerationState = 'idle' | 'waiting_for_slides_count' | 'generating_layout' | 'fetching_assets' | 'done' | 'error';

const PIXABAY_API_KEY = '45281093-6113b56f82782b3394622b79a';

// --- Funções Auxiliares ---
const fetchImageAsBase64 = async (query: string): Promise<string | null> => {
    if (!query || !PIXABAY_API_KEY) {
        console.warn("Pixabay query ou API key ausente. Pulando busca de imagem.");
        return null;
    }
    
    const URL = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=3`;
    
    try {
        const response = await fetch(URL);
        if (!response.ok) throw new Error(`Erro na API Pixabay: ${response.statusText}`);
        const data = await response.json();

        const bestHit = data.hits.find((h: any) => h.webformatURL) || data.hits[0];
        if (!bestHit) return null;

        const imageUrl = bestHit.largeImageURL || bestHit.webformatURL;
        
        // Usar o proxy da API para evitar problemas de CORS
        const proxyResponse = await fetch(`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`);
        if (!proxyResponse.ok) throw new Error(`Falha no proxy de imagem: ${proxyResponse.statusText}`);
        
        const blob = await proxyResponse.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error(`Falha ao buscar imagem para "${query}":`, error);
        return null;
    }
};

const iconToB64 = async (iconName: string, color: string): Promise<string> => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return '';

    const svgString = renderToStaticMarkup(
        React.createElement(IconComponent, { color: color, size: 256 })
    );

    const svgWithXmlns = svgString.includes('xmlns') ? svgString : svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    
    return `data:image/svg+xml;base64,${btoa(svgWithXmlns)}`;
}

export function SlideGeneratorClient() {
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [topic, setTopic] = useState('');
  const [generatedLayout, setGeneratedLayout] = useState<PresentationLayout | null>(null);
  
  const { toast } = useToast();

  const addMessage = (role: ChatMessage['role'], content: string, options: Partial<ChatMessage> = {}) => {
      setMessages(prev => [...prev, { id: prev.length, role, content, ...options }]);
  };

  const handleStartGeneration = (prompt: string) => {
    if (!prompt.trim()) return;
    const currentTopic = prompt.trim();
    setTopic(currentTopic);
    setGeneratedLayout(null);
    setMessages([{ id: 0, role: 'user', content: currentTopic }]);
    setGenerationState('waiting_for_slides_count');
    setTimeout(() => {
        addMessage('ai', 'Ótima ideia. Quantos slides (de conteúdo) você quer incluir? (Sugestão: 3 a 17)');
    }, 300)
  };
  
  const handleNumSlidesResponse = async (userMessage: string) => {
    const num = parseInt(userMessage.match(/\d+/)?.[0] || '5', 10);
    const numSlides = Math.max(2, Math.min(17, num)); // Clamp

    addMessage('user', userMessage);
    addMessage('ai', `Entendido, ${numSlides} slides. Gerando o roteiro e o design para "${topic}"...`);

    setGenerationState('generating_layout');

    try {
        const layoutResult = await generatePresentationLayout({ topic, numSlides });
        setGeneratedLayout(layoutResult);
        
        addMessage('ai', 'Roteiro e layout gerados! Agora é só baixar o seu arquivo .pptx.');
        setGenerationState('done');
        toast({ title: "Apresentação Pronta!", description: "Seu arquivo .pptx está pronto para ser baixado." });

    } catch (error) {
        console.error("Falha ao gerar o layout da apresentação:", error);
        toast({ variant: "destructive", title: "Erro de Geração", description: (error as Error).message });
        setGenerationState('error');
        addMessage('ai', 'Desculpe, ocorreu um erro ao gerar a apresentação. Tente novamente.');
    }
  }

  const handleDownloadPresentation = useCallback(async () => {
    if (!generatedLayout) {
        toast({ title: "Aguarde", description: "O layout da apresentação ainda não foi gerado.", variant: 'destructive'});
        return;
    };
    
    setGenerationState('fetching_assets');
    toast({ title: "Preparando Download...", description: "Buscando imagens e montando seu arquivo .pptx." });

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    try {
        // Otimização: buscar todos os recursos (imagens e ícones) em paralelo
        const assetPromises = generatedLayout.slides.flatMap(slideDef => 
            slideDef.elements.map(async (elem) => {
                if ((elem.kind === 'background_image' || elem.kind === 'image') && slideDef.image_query) {
                    return { id: slideDef.index, type: 'image', data: await fetchImageAsBase64(slideDef.image_query) };
                }
                if (elem.kind === 'icon' && slideDef.icon_name && elem.color) {
                    return { id: slideDef.index, type: 'icon', data: await iconToB64(slideDef.icon_name, elem.color) };
                }
                return null;
            })
        );

        const resolvedAssets = (await Promise.all(assetPromises)).filter(Boolean);

        const assetsMap = new Map<number, { image?: string; icon?: string }>();
        resolvedAssets.forEach(asset => {
            if (asset) {
                if (!assetsMap.has(asset.id)) assetsMap.set(asset.id, {});
                const current = assetsMap.get(asset.id)!;
                if (asset.type === 'image') current.image = asset.data as string;
                if (asset.type === 'icon') current.icon = asset.data as string;
            }
        });


        for (const slideDef of generatedLayout.slides) {
            const slide = pptx.addSlide({ masterName: "BLANK_SLIDE" });
            const slideAssets = assetsMap.get(slideDef.index);

            if (slideDef.backgroundColor) {
                 slide.background = { color: slideDef.backgroundColor.replace('#', '') };
            }

            for (const elem of slideDef.elements) {
                const x = elem.x / 96;
                const y = elem.y / 96;
                const w = elem.w / 96;
                const h = elem.h / 96;

                switch (elem.kind) {
                    case 'background_image':
                    case 'image':
                        if (slideAssets?.image) {
                            slide.addImage({ data: slideAssets.image, x, y, w, h, sizing: { type: 'cover', w, h } });
                        }
                        if (elem.overlay) {
                             slide.addShape(pptx.shapes.RECTANGLE, {
                                x, y, w, h,
                                fill: { type: 'solid', color: elem.overlay.color.replace('#', ''), transparency: elem.overlay.opacity * 100 }
                            });
                        }
                        break;
                    
                    case 'icon':
                         if (slideAssets?.icon) {
                            slide.addImage({ data: slideAssets.icon, x, y, w, h });
                        }
                        break;

                    case 'title':
                    case 'subtitle':
                    case 'body':
                    case 'quote':
                    case 'attribution':
                         if (elem.text) {
                            slide.addText(elem.text.split('\\n'), {
                                shape: pptx.shapes.RECTANGLE,
                                x, y, w, h,
                                fontFace: elem.fontFace || "Arial",
                                fontSize: elem.fontSize,
                                color: elem.color?.replace('#', ''),
                                align: elem.align as 'left' | 'center' | 'right',
                                bold: elem.bold,
                                lineSpacing: (elem.fontSize || 18) * 1.5,
                            });
                        }
                        break;
                }
            }
        }
        
        await pptx.writeFile({ fileName: `${generatedLayout.presentation_title.replace(/\s/g, '_') || 'apresentacao'}.pptx` });
        setGenerationState('done');

    } catch (e) {
        console.error("Erro durante a geração do PPTX", e);
        toast({ title: "Erro no Download", description: "Houve um problema ao processar os arquivos para o PPTX.", variant: 'destructive'});
        setGenerationState('error');
    }
  }, [generatedLayout, toast]);

  const handleReset = () => {
    setGenerationState('idle');
    setMessages([]);
    setTopic('');
    setGeneratedLayout(null);
  };
  
  const isDownloading = generationState === 'fetching_assets';

  return (
    <div className={cn("flex h-screen flex-col", colorSettings.pageBackground)}>
        <header className={cn("flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6", colorSettings.headerBorder)}>
            <div className="flex items-center gap-2">
                <Wand2 className={cn("h-6 w-6", colorSettings.headerIcon)} />
                <h1 className={colorSettings.headerTitle}>Gerador de Slides</h1>
            </div>
            {generationState === 'done' && (
                <div className="flex items-center gap-2">
                     <Button onClick={handleReset} variant="ghost">Criar Outra</Button>
                     <Button onClick={handleDownloadPresentation} disabled={isDownloading} className={colorSettings.downloadButton}>
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Baixar Apresentação
                    </Button>
                </div>
            )}
        </header>

      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            <ChatView 
                messages={messages}
                generationState={generationState}
                onNumSlidesResponse={handleNumSlidesResponse}
            />
        </div>
      </main>

      {(generationState !== 'done' && generationState !== 'fetching_assets') && (
        <ChatView.Footer
          generationState={generationState}
          onStartGeneration={handleStartGeneration}
          onNumSlidesResponse={handleNumSlidesResponse}
        />
      )}
    </div>
  );
}
