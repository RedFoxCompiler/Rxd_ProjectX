
'use client';

import { useState, type KeyboardEvent, useRef, useEffect } from 'react';
import Image from 'next/image';
import Textarea from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Send,
  Plus,
  Camera,
  SwitchCamera,
  X,
  Square,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Message, SendMessageHandler } from '../chat/chat';
import { colorSettings } from './color-settings';
import { ToolsPanel, Tool } from './tools-panel';

interface ChatInputProps {
  onSendMessage: SendMessageHandler;
  isLoading: boolean;
  onStop: () => void;
}

export function ChatInput({ onSendMessage, isLoading, onStop }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Message['attachment'][]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for Camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');

  useEffect(() => {
    // Cleanup camera stream
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  useEffect(() => {
    // Camera Logic
    if (isCameraOpen) {
      const startStream = async () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: cameraFacingMode },
          });
          setStream(newStream);
          if (videoRef.current) videoRef.current.srcObject = newStream;
        } catch (error) {
          console.error('Error accessing camera:', error);
          toast({
            variant: 'destructive',
            title: 'Acesso à câmera negado',
            description: 'Por favor, habilite o acesso à câmera nas configurações do seu navegador.',
          });
          setIsCameraOpen(false);
        }
      };
      startStream();
    } else {
      stream?.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraOpen, cameraFacingMode, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    
    let content = input;
    const finalAttachments = attachments;

    if (selectedTool?.tool) {
         onSendMessage('text', `${selectedTool.tool} ${content}`, { attachments: finalAttachments });
         // The message sent to the AI includes the command, but the UI will show just the content
         // if we decide to handle that logic in the chat component.
    } else {
        onSendMessage('text', content, { attachments: finalAttachments });
    }
    
    setInput('');
    setAttachments([]);
    setSelectedTool(null); 
  };


  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
     if (e.key === 'Backspace' && input === '' && selectedTool) {
      e.preventDefault();
      setSelectedTool(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
        const newAttachments = Array.from(files).slice(0, 2 - attachments.length);

        if (newAttachments.length === 0 && files.length > 0) {
             toast({
                variant: 'destructive',
                title: 'Limite de anexos atingido',
                description: 'Você pode anexar no máximo 2 arquivos.',
            });
            return;
        }

        newAttachments.forEach(file => {
             if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast({
                variant: 'destructive',
                title: 'Arquivo muito grande',
                description: `O arquivo ${file.name} é maior que 10MB.`,
                });
                return;
            }
            if (
                !file.type.startsWith('image/') &&
                !file.type.startsWith('audio/') &&
                !file.type.startsWith('video/')
            ) {
                toast({
                variant: 'destructive',
                title: 'Tipo de arquivo inválido',
                description: 'Apenas imagens, áudios e vídeos são suportados.',
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = loadEvent => {
                const fileDataUrl = loadEvent.target?.result as string;
                setAttachments(prev => [...prev, { name: file.name, url: fileDataUrl, type: file.type }]);
            };
            reader.readAsDataURL(file);
        });

      setIsToolsPanelOpen(false);
      setSelectedTool(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }

  const takePicture = () => {
    if (videoRef.current && canvasRef.current && flashRef.current) {
      if (attachments.length >= 2) {
          toast({
              variant: 'destructive',
              title: 'Limite de anexos atingido',
              description: 'Você pode anexar no máximo 2 arquivos.',
          });
          return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (cameraFacingMode === 'user') {
        context?.translate(canvas.width, 0);
        context?.scale(-1, 1);
      }
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setAttachments(prev => [...prev, {
        name: 'snapshot.png',
        url: dataUrl,
        type: 'image/png',
      }]);
      setSelectedTool(null);
      const flasher = flashRef.current;
      flasher.classList.add('animate-camera-flash');
      flasher.onanimationend = () => {
        flasher.classList.remove('animate-camera-flash');
        setIsCameraOpen(false);
        setIsToolsPanelOpen(false);
      };
    }
  };

  const toggleCameraFacingMode = () => {
    setCameraFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    setAttachments([]);
    setIsToolsPanelOpen(false);
  };
  
 const ActiveToolPill = () => {
    if (!selectedTool) return null;
    const Icon = selectedTool.icon;
    return (
       <div className="absolute left-2 -top-10 z-20 animate-float">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-zinc-800/80 backdrop-blur-sm border border-white/10 shadow-lg transition-transform active:scale-90"
            onClick={() => setSelectedTool(null)}
          >
            <Icon className="h-5 w-5 text-destructive" />
          </Button>
       </div>
    )
  }

  return (
    <>
      <div className="px-4 pb-4 sm:px-6 sm:pb-6 w-full max-w-3xl mx-auto flex flex-col">
        {attachments.length > 0 && (
          <div className="w-full mb-4 pl-12 h-20">
            <div className="relative h-full">
                {attachments.map((attachment, index) => (
                    <div 
                        key={index} 
                        className={cn(
                            "absolute top-0 w-24 h-20 bg-zinc-700 rounded-2xl overflow-hidden shadow-lg border-2 border-zinc-600 transition-all duration-300",
                            index === 0 && "z-10 -rotate-3 hover:-rotate-6",
                            index === 1 && "z-0 left-8 top-1 rotate-3 hover:rotate-6"
                        )}
                        style={{
                           left: index === 0 ? '0' : '2rem',
                           top: index === 1 ? '0.25rem' : '0'
                        }}
                     >
                        <Image
                            src={attachment?.url && attachment.type.startsWith('image/') ? attachment.url : '/placeholder.png'}
                            alt={attachment.name}
                            layout="fill"
                            objectFit="cover"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm z-20"
                            onClick={() => handleRemoveAttachment(index)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
            </div>
          </div>
        )}
        <div className={cn('animated-border-wrapper', isFocused && 'is-focused')}>
            <div
            className={cn(
                'relative flex items-end w-full rounded-[19px] shadow-inner backdrop-blur-sm',
                colorSettings.inputBackground
            )}
            >
            <ActiveToolPill />

            <div className="flex-shrink-0 pl-2 self-center">
                {!selectedTool && (
                    <ToolsPanel
                        onFileSelect={() => fileInputRef.current?.click()}
                        onCameraSelect={() => setIsCameraOpen(true)}
                        onToolSelect={handleToolSelect}
                    />
                )}
            </div>

            <Textarea
                value={input}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedTool ? `Descrição para ${selectedTool.label}...` : "Converse com a Nyx"}
                className={cn(
                'w-full flex-1 resize-none border-none bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 z-10 relative overflow-y-auto no-scrollbar max-h-48 py-3.5',
                colorSettings.inputText,
                colorSettings.inputPlaceholder,
                selectedTool ? 'pl-4' : 'pl-2'
                )}
                disabled={isLoading}
                aria-label="Chat message input"
                rows={1}
            />

            <div className="flex-shrink-0 pr-2 self-center">
                {isLoading ? (
                    <Button
                        type="button"
                        onClick={onStop}
                        variant="destructive"
                        size="icon"
                        className={cn('h-10 w-10 rounded-full transition-transform active:scale-90')}
                    >
                        <Square className="h-5 w-5" />
                    </Button>
                ) : (
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'h-10 w-10 rounded-full disabled:opacity-50 transition-transform active:scale-90',
                            colorSettings.inputButton
                        )}
                        disabled={(!input.trim() && attachments.length === 0)}
                        >
                        <Send className="h-5 w-5" />
                    </Button>
                )}
            </div>
            </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*,audio/*"
          className="hidden"
          multiple
        />
      </div>
      
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-full w-full h-full p-0 m-0 border-none bg-black flex flex-col items-center justify-center">
            <DialogHeader className="sr-only">
              <DialogTitle>Visualização da Câmera</DialogTitle>
              <DialogDescription>
                Use a câmera para tirar uma foto para anexar à sua mensagem.
              </DialogDescription>
            </DialogHeader>
          <div
            ref={flashRef}
            className="absolute inset-0 z-50 pointer-events-none"
          />
          <canvas ref={canvasRef} className="hidden" />

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{ transform: cameraFacingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' }}
          />

          <div className="absolute top-4 left-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCameraOpen(false)}
              className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/75 backdrop-blur-sm"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCameraFacingMode}
              className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/75 backdrop-blur-sm"
            >
              <SwitchCamera className="h-6 w-6" />
            </Button>
          </div>
          <div className="absolute bottom-10 z-10 flex justify-center w-full">
            <button
              onClick={takePicture}
              className="h-20 w-20 rounded-full bg-white ring-4 ring-white/30"
              aria-label="Tirar foto"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
