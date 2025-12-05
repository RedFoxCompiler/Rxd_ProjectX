
"use client";

import { useEffect, useRef } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Message } from "./chat";
import { MessageBubble } from "./message-bubble";
import { cn } from "@/lib/utils";
import { PresentationLayout } from "@/ai/flows/generate-presentation-flow";

interface ChatHistoryProps {
  messages: Message[];
  onRegenerate: (messageId: string) => void;
  onDownloadPresentation: (layout: PresentationLayout) => void;
}

export function ChatHistory({ messages, onRegenerate, onDownloadPresentation }: ChatHistoryProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (viewport) {
      const isScrolledToBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 1;
      isAtBottomRef.current = isScrolledToBottom;
    }
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport && isAtBottomRef.current) {
        viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const viewport = viewportRef.current;
    viewport?.addEventListener('scroll', handleScroll);
    return () => viewport?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ScrollArea className={cn("flex-1 w-full no-scrollbar")} viewportRef={viewportRef}>
      <div className="flex flex-col gap-4 p-4 pt-24 pb-4 w-full max-w-3xl mx-auto">
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            onRegenerate={onRegenerate}
            onDownloadPresentation={onDownloadPresentation}
          />
        ))}
      </div>
       <ScrollBar className="hidden" />
    </ScrollArea>
  );
}
