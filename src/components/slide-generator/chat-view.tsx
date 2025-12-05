
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, GenerationState } from './slide-generator-client';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Loader2, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Textarea from 'react-textarea-autosize';
import { colorSettings } from './color-settings';

interface ChatViewProps {
  messages: ChatMessage[];
  generationState: GenerationState;
  onNumSlidesResponse: (num: string) => void;
}

export function ChatView({ 
    messages, 
    generationState,
    onNumSlidesResponse
}: ChatViewProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, generationState]);

  const isLoading = generationState === 'generating_layout' || generationState === 'fetching_assets';

  if (generationState === 'idle' && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full animate-in fade-in duration-500 p-4">
        <Sparkles className={cn("mx-auto h-12 w-12", colorSettings.chat.placeholderText)} />
        <h2 className="mt-4 text-2xl font-semibold text-zinc-300">Transforme sua ideia em uma apresentação.</h2>
        <p className={cn("mt-2", colorSettings.chat.placeholderText)}>Comece descrevendo o tópico abaixo.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 w-full max-w-3xl mx-auto" ref={scrollAreaRef}>
      <div className="flex flex-col gap-4 p-4">
        {messages
          .filter((m) => !m.isHidden)
          .map((msg) => (
            <div key={msg.id} className={cn('flex w-full items-start gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role !== 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={colorSettings.chat.avatarFallback}>
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn('max-w-[85%] rounded-2xl p-3 text-sm shadow-md', msg.role === 'user' ? colorSettings.chat.userBubble : colorSettings.chat.aiBubble)}>
                {msg.content && <p>{msg.content}</p>}
              </div>
              {msg.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={colorSettings.chat.userAvatarFallback}>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        {isLoading && (
          <div className={cn("flex items-center space-x-2 p-2 text-sm", colorSettings.chat.loadingText)}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{generationState === 'generating_layout' ? 'Criando roteiro e design...' : 'Montando seu arquivo .pptx...'}</span>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

interface ChatFooterProps {
    generationState: GenerationState;
    onStartGeneration: (prompt: string) => void;
    onNumSlidesResponse: (num: string) => void;
}

ChatView.Footer = function ChatFooter({ generationState, onStartGeneration, onNumSlidesResponse }: ChatFooterProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const isLoading = generationState === 'generating_layout' || generationState === 'fetching_assets';

  const handleSendMessage = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    if (generationState === 'idle') {
      onStartGeneration(trimmedInput);
    } else if (generationState === 'waiting_for_slides_count') {
      onNumSlidesResponse(trimmedInput);
    }
    setInput('');
  };

  const getPlaceholder = () => {
      switch(generationState) {
          case 'idle': return "Ex: Uma apresentação sobre a história da computação";
          case 'waiting_for_slides_count': return "Digite o número de slides...";
          default: return "A IA está trabalhando...";
      }
  }

  const isInputDisabled = isLoading || (generationState !== 'idle' && generationState !== 'waiting_for_slides_count');

  return (
    <footer className="w-full p-4 shrink-0">
      <div className="mx-auto w-full max-w-3xl">
        <div className={cn('animated-border-wrapper', (isLoading || isFocused) && 'is-focused')}>
          <div className={cn('relative flex items-end w-full rounded-[19px] shadow-inner', colorSettings.input.background)}>
            <Textarea
              value={input}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={getPlaceholder()}
              className={cn("w-full resize-none border-none bg-transparent text-base focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 min-h-[52px] pr-12", colorSettings.input.placeholder)}
              disabled={isInputDisabled}
              rows={1}
            />
            <div className="absolute right-3 bottom-2 flex items-center gap-1 z-10">
              <Button
                onClick={handleSendMessage}
                disabled={isInputDisabled || !input.trim()}
                size="icon"
                className={cn("h-9 w-9 rounded-full shrink-0", colorSettings.input.sendButton)}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
