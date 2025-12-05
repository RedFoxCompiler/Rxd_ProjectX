
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { multiStepReasoning, type MultiStepReasoningOutput } from '@/ai/flows/multi-step-reasoning-flow';
import { generateImageFlow } from '@/ai/flows/generate-image-flow';
import { generateVideoFlow } from '@/ai/flows/generate-video-flow';
import { generateConversationStarter } from '@/ai/flows/generate-conversation-starter';
import { generatePresentationLayout, PresentationLayout } from '@/ai/flows/generate-presentation-flow';
import { generateChatTitleFlow } from '@/ai/flows/generate-chat-title-flow';
import PptxGenJS from 'pptxgenjs';
import { renderToStaticMarkup } from 'react-dom/server';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { collection, query, orderBy, serverTimestamp, Timestamp, doc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ChatHistory } from './chat-history';
import { ChatInput } from './chat-input';
import { NameSetup } from './name-setup';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Part } from 'genkit';
import { GreetingScreen } from './greeting-screen';
import { TaskStatus } from './status-indicator';


export type SendMessageHandler = (
  type: 'text',
  content: string,
  options?: {
    attachments?: Message['attachments'];
  }
) => void;

// Represents a message in the UI
export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp?: Timestamp | Date;
  status?: TaskStatus;
  attachment?: {
    name: string;
    url?: string;
    type: string;
    payload?: any;
  };
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

// Represents the structure of a message document in Firestore
export interface MessageDoc {
  role: 'user' | 'ai';
  content: string;
  timestamp: Timestamp;
  userId: string;
  status?: TaskStatus;
  attachment?: Message['attachment'];
   attachments?: Message['attachments'];
}

const ANONYMOUS_MESSAGE_LIMIT = 6;

interface PresentationDialogState {
    isOpen: boolean;
    topic: string;
}

interface ChatProps {
    isNewUser: boolean;
    isUserLoading: boolean;
    onNameSetupComplete: () => void;
    showMainUI: boolean;
}

const PIXABAY_API_KEY = '45281093-6113b56f82782b3394622b79a';

const fetchImageAsBase64 = async (query: string): Promise<string | null> => {
    if (!query || !PIXABAY_API_KEY) return null;
    const URL = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=3`;
    try {
        const response = await fetch(URL);
        if (!response.ok) throw new Error(`Erro na API Pixabay: ${response.statusText}`);
        const data = await response.json();
        const bestHit = data.hits.find((h: any) => h.webformatURL) || data.hits[0];
        if (!bestHit) return null;
        const imageUrl = bestHit.largeImageURL || bestHit.webformatURL;
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
    const svgString = renderToStaticMarkup(React.createElement(IconComponent, { color: color, size: 256 }));
    const svgWithXmlns = svgString.includes('xmlns') ? svgString : svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    return `data:image/svg+xml;base64,${btoa(svgWithXmlns)}`;
}

export function Chat({ isNewUser, isUserLoading, onNameSetupComplete, showMainUI }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [suggestedStarter, setSuggestedStarter] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [presentationDialog, setPresentationDialog] = useState<PresentationDialogState>({ isOpen: false, topic: '' });
  const [numSlides, setNumSlides] = useState('5');
  
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeChatId = useMemo(() => searchParams.get('id'), [searchParams]);

  const messagesColRef = useMemoFirebase(() => {
    if (!firestore || !user || !activeChatId) return null;
    return collection(firestore, 'users', user.uid, 'conversations', activeChatId, 'messages');
  }, [firestore, user, activeChatId]);
  
  const messagesQuery = useMemoFirebase(() => {
    if (!messagesColRef) return null;
    return query(messagesColRef, orderBy('timestamp', 'asc'));
  }, [messagesColRef]);

  const { data: firestoreMessages } = useCollection<MessageDoc>(messagesQuery);
  
  const userMessageCount = useMemo(() => 
    firestoreMessages?.filter(m => m.role === 'user').length || 0, 
    [firestoreMessages]
  );
  
  // Effect for anonymous sign-in
  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth, true).catch(error => {
        console.error("Anonymous sign-in failed:", error);
        toast({
          variant: 'destructive',
          title: 'Falha na Conexão',
          description: 'Não foi possível iniciar uma sessão de convidado.'
        });
      });
    }
  }, [user, isUserLoading, auth, toast]);

  // Effect to populate UI messages from Firestore
  useEffect(() => {
    if (firestoreMessages) {
      const msgs = firestoreMessages.map(doc => ({
        ...doc,
        id: doc.id,
      }));
      setMessages(msgs);
    } else {
      setMessages([]);
    }
  }, [firestoreMessages, activeChatId]);

  // Effect to fetch a conversation starter
  useEffect(() => {
    if (showMainUI && messages.length === 0 && !activeChatId && !suggestedStarter) {
        generateConversationStarter({}).then(res => {
            setSuggestedStarter(res.starter);
        }).catch(() => {
            setSuggestedStarter("Como posso te ajudar hoje?");
        });
    }
  }, [showMainUI, messages.length, activeChatId, suggestedStarter]);
  

  const createNewChat = useCallback(async (firstMessageContent: string): Promise<string> => {
    if (!user || !firestore) throw new Error("User or Firestore not available");

    const title = firstMessageContent.substring(0, 30) || "Nova Conversa";
    
    const chatsColRef = collection(firestore, 'users', user.uid, 'conversations');
    const newChatDocRef = await addDocumentNonBlocking(chatsColRef, {
      title: title,
      createdAt: serverTimestamp(),
      userId: user.uid,
    });

    if (!newChatDocRef) throw new Error("Failed to create new chat document.");
    
    return newChatDocRef.id;
  }, [user, firestore]);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
    if (firestore && user && activeChatId) {
        const msgRef = doc(firestore, 'users', user.uid, 'conversations', activeChatId, 'messages', messageId);
        // We only update, not create here, so it should exist.
        updateDocumentNonBlocking(msgRef, updates);
    }
  }, [firestore, user, activeChatId]);


  const executeTool = useCallback(async (
        chatId: string,
        responseId: string,
        toolCall: MultiStepReasoningOutput['toolCall']
    ) => {
        if (!toolCall) return;

        try {
            let resultAttachment: Message['attachment'] | undefined;
            let statusUpdate: TaskStatus | undefined;

            if (toolCall.name === 'generateImageTool') {
                statusUpdate = { state: 'loading', label: 'Criando Imagem...' };
                updateMessage(responseId, { status: statusUpdate });
                const imageResult = await generateImageFlow({ prompt: toolCall.args.prompt });
                resultAttachment = { name: 'generated-image.png', url: imageResult.imageUrl, type: 'image/png' };
            } else if (toolCall.name === 'generateVideoTool') {
                statusUpdate = { state: 'loading', label: 'Criando Vídeo...' };
                updateMessage(responseId, { status: statusUpdate });
                const videoResult = await generateVideoFlow({ prompt: toolCall.args.prompt });
                resultAttachment = { name: 'generated-video.mp4', url: videoResult.videoUrl, type: 'video/mp4' };
            }
            
            if (resultAttachment) {
                updateMessage(responseId, { status: { state: 'success', label: 'Sucesso!' }, attachment: resultAttachment });
            }

        } catch (error) {
            console.error(`Tool execution failed for ${toolCall.name}:`, error);
            updateMessage(responseId, {
                status: { state: 'error', label: 'Falha na Ferramenta' },
                content: `${messages.find(m => m.id === responseId)?.content}\n\nDesculpe, a ferramenta não pôde ser executada.`
            });
        }

  }, [updateMessage, messages]);


  const handleSendMessage: SendMessageHandler = useCallback(async (type, content, options) => {
    if ((!content.trim() && !options?.attachments?.length) || isAiThinking || !user || !firestore) return;

    if (user.isAnonymous && userMessageCount >= ANONYMOUS_MESSAGE_LIMIT) {
        setShowLoginPrompt(true);
        return;
    }
    
    setIsAiThinking(true);
    let currentChatId = activeChatId;
    
    // Check if it's a presentation request
    const isPresentationRequest = content.trim().startsWith('/presentation');
    if (isPresentationRequest) {
        const topic = content.replace('/presentation', '').trim();
        setPresentationDialog({ isOpen: true, topic: topic });
        setIsAiThinking(false);
        return;
    }

    if (!currentChatId) {
        if (user.isAnonymous) {
            toast({ title: 'Crie uma conta para salvar suas conversas' });
            setIsAiThinking(false);
            return;
        }
        try {
            const newChatId = await createNewChat(content || "Nova Conversa");
            router.push(`/chat?id=${newChatId}`, { scroll: false });
            currentChatId = newChatId;
        } catch (error) {
            console.error("Failed to create new chat:", error);
            toast({ variant: 'destructive', title: 'Não foi possível criar uma nova conversa.' });
            setIsAiThinking(false);
            return;
        }
    }
    
    const finalChatId = currentChatId;
    if (!finalChatId) {
        console.error("No active chat ID after creation attempt.");
        setIsAiThinking(false);
        return;
    }

    const userMessage: Message = {
        id: `optimistic-user-${Date.now()}`,
        role: 'user',
        content: content,
        timestamp: new Date(),
        attachments: options?.attachments,
    };
    
    const currentHistory = firestoreMessages || [];
    const updatedHistory = [...currentHistory, userMessage];
    setMessages(updatedHistory);
    
    addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'conversations', finalChatId, 'messages'), {
        role: 'user',
        content: content,
        timestamp: serverTimestamp(),
        userId: user.uid,
        ...(options?.attachments && { attachments: options.attachments }),
    });


    try {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const history: { role: 'user' | 'model'; parts: Part[] }[] = updatedHistory.slice(0,-1).map(m => {
            const parts: Part[] = [];
            if (m.content) parts.push({ text: m.content });
            
            const allAttachments = m.attachments || (m.attachment ? [m.attachment] : []);
            allAttachments.forEach(att => {
                if (att.url) {
                    parts.push({ media: { url: att.url } });
                }
            });

            return {
              role: m.role === 'ai' ? ('model' as const) : ('user' as const),
              parts: parts.filter(p => p.text || p.media?.url),
            };
        });
        
        const userPrompt: Part[] = [];
        if (userMessage.content) userPrompt.push({ text: userMessage.content });
        if (userMessage.attachments) {
          userMessage.attachments.forEach(att => userPrompt.push({ media: { url: att.url } }));
        }

        const now = new Date();
        const currentDateTime = now.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            dateStyle: 'full',
            timeStyle: 'short',
        });

        const response = await multiStepReasoning({
            history: history,
            prompt: userPrompt,
            context: 'chat',
            currentDateTime: currentDateTime
        });

        if (controller.signal.aborted) {
          throw new Error('AbortError');
        }

        const aiResponseId = `ai-${Date.now()}`;
        
        const status = response.toolCall ? { state: 'loading' as const, label: 'Reconhecendo Tarefa...' } : undefined;

        const finalAiMessageDoc: MessageDoc = {
            role: 'ai',
            content: response.content,
            timestamp: serverTimestamp() as Timestamp,
            userId: user.uid,
            ...(response.attachment && { attachment: response.attachment }),
            ...(status && { status: status }),
        };
        
        await setDocumentNonBlocking(doc(firestore, 'users', user.uid, 'conversations', finalChatId, 'messages', aiResponseId), finalAiMessageDoc);
        
        // If there's a tool call, execute it
        if (response.toolCall) {
            await executeTool(finalChatId, aiResponseId, response.toolCall);
        }

        // After the 2nd user message (4 total messages: user, ai, user, ai), generate a title.
        const userMessagesInHistory = updatedHistory.filter(m => m.role === 'user').length;
        if (userMessagesInHistory === 2) {
             const titleHistory = updatedHistory.slice(0, 4).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                content: m.content
            }));
            generateChatTitleFlow({ history: titleHistory }).then(result => {
                const chatDocRef = doc(firestore, 'users', user.uid, 'conversations', finalChatId);
                updateDocumentNonBlocking(chatDocRef, { title: result.title });
            });
        }


    } catch (error: any) {
        if (error.name !== 'AbortError') {
             console.error("AI Error:", error);
            const errorContent = error.message.includes('429') 
                ? "Desculpe, a cota da API foi excedida. Por favor, verifique sua chave de API e plano de faturamento."
                : "Desculpe, ocorreu um erro ao me conectar com a IA. Por favor, tente novamente.";
            
            const aiErrorMessageDoc = { role: 'ai' as const, content: errorContent, timestamp: serverTimestamp() as Timestamp, userId: user.uid, status: { state: 'error', label: 'Erro' } as TaskStatus };

            addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'conversations', finalChatId, 'messages'), aiErrorMessageDoc);
        }
    } finally {
        setIsAiThinking(false);
        abortControllerRef.current = null;
    }
  }, [activeChatId, user, firestore, userMessageCount, isAiThinking, toast, router, createNewChat, firestoreMessages, executeTool]);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleGenerateAndDownloadPresentation = async (layout: PresentationLayout) => {
    if (!layout) return;

    toast({ title: "Preparando Download...", description: "Buscando imagens e montando seu arquivo .pptx." });
    
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    try {
        const assetPromises = layout.slides.flatMap(slideDef => 
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

        for (const slideDef of layout.slides) {
            const slide = pptx.addSlide({ masterName: "BLANK_SLIDE" });
            const slideAssets = assetsMap.get(slideDef.index);
            if (slideDef.backgroundColor) slide.background = { color: slideDef.backgroundColor.replace('#', '') };

            for (const elem of slideDef.elements) {
                const x = elem.x / 96; const y = elem.y / 96; const w = elem.w / 96; const h = elem.h / 96;
                switch (elem.kind) {
                    case 'background_image':
                    case 'image':
                        if (slideAssets?.image) slide.addImage({ data: slideAssets.image, x, y, w, h, sizing: { type: 'cover', w, h } });
                        if (elem.overlay) slide.addShape(pptx.shapes.RECTANGLE, { x, y, w, h, fill: { type: 'solid', color: elem.overlay.color.replace('#', ''), transparency: elem.overlay.opacity * 100 } });
                        break;
                    case 'icon':
                        if (slideAssets?.icon) slide.addImage({ data: slideAssets.icon, x, y, w, h });
                        break;
                    case 'title': case 'subtitle': case 'body': case 'quote': case 'attribution':
                        if (elem.text) slide.addText(elem.text.split('\\n'), { shape: pptx.shapes.RECTANGLE, x, y, w, h, fontFace: elem.fontFace || "Arial", fontSize: elem.fontSize, color: elem.color?.replace('#', ''), align: elem.align as 'left' | 'center' | 'right', bold: elem.bold, lineSpacing: (elem.fontSize || 18) * 1.5 });
                        break;
                }
            }
        }
        await pptx.writeFile({ fileName: `${layout.presentation_title.replace(/\s/g, '_') || 'apresentacao'}.pptx` });
        toast({ title: "Download Concluído!", description: "Sua apresentação foi baixada." });
    } catch (e) {
        console.error("Erro durante a geração do PPTX", e);
        toast({ title: "Erro no Download", description: "Houve um problema ao criar o arquivo .pptx.", variant: 'destructive'});
    }
  }
  
  const handlePresentationFlow = useCallback(async (topic: string, numSlidesStr: string) => {
    if (!topic || !numSlidesStr) return;
    const slideCount = parseInt(numSlidesStr, 10);
    if (isNaN(slideCount) || slideCount < 2 || slideCount > 17) {
        toast({ title: "Número de slides inválido", description: "Por favor, insira um número entre 2 e 17.", variant: "destructive" });
        return;
    }
    
    setPresentationDialog({ isOpen: false, topic: '' });
    
    let currentChatId = activeChatId;
    if (!currentChatId && user && !user.isAnonymous) {
        try {
            const newChatId = await createNewChat(`Apresentação: ${topic}`);
            router.push(`/chat?id=${newChatId}`, { scroll: false });
            currentChatId = newChatId;
        } catch (error) {
            console.error("Failed to create new chat for presentation:", error);
            toast({ variant: 'destructive', title: 'Não foi possível criar uma nova conversa.' });
            return;
        }
    }
    const finalChatId = currentChatId;
    if (!finalChatId || !user) {
        toast({ variant: 'destructive', title: 'Nenhuma conversa ativa para adicionar a apresentação.' });
        return;
    }
    
    setIsAiThinking(true);
    toast({ title: "Gerando sua apresentação...", description: "Isso pode levar um momento. Criando roteiro e design." });
    
    const userMessageContent = `Crie uma apresentação de ${slideCount} slides sobre "${topic}".`;
    const userMessage: Message = { id: `optimistic-user-${Date.now()}`, role: 'user', content: userMessageContent, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'conversations', finalChatId, 'messages'), {
        role: 'user', content: userMessageContent, timestamp: serverTimestamp(), userId: user.uid
    });
    
    try {
        const layoutResult = await generatePresentationLayout({ topic, numSlides: slideCount });
        const aiResponseId = `ai-response-${Date.now()}`;
        const aiMessageContent = `Prontinho! ${layoutResult.slides.length - 1} slides foram gerados sobre o tema: "${layoutResult.presentation_title}".\n\nEu criei um roteiro completo, escolhi uma paleta de cores e fontes para um design minimalista e elegante, e selecionei os melhores layouts para cada tipo de conteúdo. Para garantir um visual limpo, usei uma combinação de cores sólidas e imagens de fundo de alta qualidade apenas onde elas agregam valor. O resultado é uma apresentação profissional e esteticamente agradável, pronta para ser usada. Clique abaixo para ver e baixar o arquivo.`;

        const aiMessage: MessageDoc = {
            role: 'ai',
            content: aiMessageContent,
            timestamp: serverTimestamp() as Timestamp,
            userId: user.uid,
            attachment: {
                name: layoutResult.presentation_title,
                type: 'application/vnd.presentation',
                payload: layoutResult
            }
        };

        await setDocumentNonBlocking(doc(firestore, 'users', user.uid, 'conversations', finalChatId, 'messages', aiResponseId), aiMessage);

    } catch (e) {
        console.error("Erro durante a geração do PPTX", e);
        addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'conversations', finalChatId, 'messages'), {
            role: 'ai', content: "Desculpe, não consegui gerar a apresentação. Tente novamente.", timestamp: serverTimestamp(), userId: user.uid
        });
        toast({ title: "Erro na Geração", description: "Houve um problema ao criar a apresentação.", variant: 'destructive'});
    } finally {
        setIsAiThinking(false);
    }
  }, [toast, activeChatId, user, firestore, createNewChat, router]);
  
  const handleRegenerate = useCallback(async (messageId: string) => {
    toast({ title: "Função indisponível", description: "A regeneração de resposta ainda não foi implementada." });
  }, [toast]);
  
  const handleLoginRedirect = () => {
    router.push('/login');
  };
  
  const handleNameSet = (name: string) => {
    if (user && auth.currentUser) {
      updateProfile(auth.currentUser, { displayName: name });
      if (firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userDocRef, { name: name }, { merge: true });
      }
      onNameSetupComplete();
    }
  };


  const isLoading = isUserLoading || (!!activeChatId && !firestoreMessages);
  const showGreeting = !isLoading && showMainUI && messages.length === 0 && !activeChatId;
  const showNameSetup = !isLoading && isNewUser && !showMainUI;
  
  return (
     <>
      {showNameSetup ? (
        <NameSetup onNameSet={handleNameSet} />
      ) : (
        <div className={cn(
          "relative w-full h-full flex flex-col items-center",
          "transition-opacity duration-500",
          showMainUI ? "opacity-100" : "opacity-0"
        )}>
          {isLoading && (
              <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
          )}

          {showGreeting && (
             <GreetingScreen userName={user?.displayName} starter={suggestedStarter} />
          )}

          {!isLoading && !showGreeting && (
            <ChatHistory 
                messages={messages} 
                onRegenerate={handleRegenerate}
                onDownloadPresentation={handleGenerateAndDownloadPresentation}
            />
          )}
          
          {showMainUI && (
            <div className="w-full">
              <ChatInput 
                onSendMessage={handleSendMessage} 
                isLoading={isAiThinking} 
                onStop={handleStopGeneration}
              />
            </div>
          )}
        </div>
      )}
      
    <Dialog open={presentationDialog.isOpen} onOpenChange={(isOpen) => setPresentationDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-800 border-zinc-700 text-white">
            <DialogHeader>
                <DialogTitle>Gerar Apresentação</DialogTitle>
                <DialogDescription>
                    Quantos slides de conteúdo você gostaria que a apresentação sobre "{presentationDialog.topic}" tivesse?
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Input
                    id="numSlides"
                    type="number"
                    value={numSlides}
                    onChange={(e) => setNumSlides(e.target.value)}
                    placeholder="Ex: 5"
                    className="bg-zinc-700 border-zinc-600 text-white"
                />
            </div>
            <DialogFooter>
                <Button onClick={() => handlePresentationFlow(presentationDialog.topic, numSlides)} className="bg-destructive hover:bg-destructive/90 text-white">Gerar Apresentação</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Continue a conversa</AlertDialogTitle>
          <AlertDialogDescription>
            Você atingiu o limite de mensagens para convidados. Por favor, crie uma conta ou faça login para conversar sem limites e salvar seu histórico.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
           <AlertDialogAction onClick={handleLoginRedirect}>Fazer Login</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
