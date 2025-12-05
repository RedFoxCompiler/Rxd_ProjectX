
'use client';

import Image from "next/image";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "./chat";
import { Copy as CopyIcon, Check, Play, ChevronRight, FileSliders } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useToast } from "@/hooks/use-toast";
import { colorSettings } from './color-settings';
import { PresentationLayout } from "@/ai/flows/generate-presentation-flow";
import { StatusIndicator } from "./status-indicator";

interface MessageBubbleProps {
  message: Message;
  onRegenerate: (messageId: string) => void;
  onDownloadPresentation: (layout: PresentationLayout) => void;
}

const VideoPlayer = ({ url }: { url: string }) => {
     const videoRef = useRef<HTMLVideoElement>(null);
     const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current?.play();
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };

    return (
         <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2 group/video cursor-pointer" onClick={togglePlay}>
             <video ref={videoRef} src={url} className="w-full h-full object-cover" loop onEnded={() => setIsPlaying(false)} />
             {!isPlaying && (
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity opacity-0 group-hover/video:opacity-100">
                     <div className="h-14 w-14 rounded-full bg-white/20 text-white backdrop-blur-sm flex items-center justify-center">
                        <Play className="h-8 w-8 ml-1" />
                    </div>
                 </div>
             )}
        </div>
    );
}

const ActionableAttachment = ({ attachment, onDownloadPresentation }: { attachment: Message['attachment'], onDownloadPresentation: (layout: PresentationLayout) => void }) => {
    if (!attachment || !attachment.payload) return null;
    
    const handleAction = () => {
        if (attachment.type === 'application/vnd.presentation') {
            onDownloadPresentation(attachment.payload as PresentationLayout);
        }
    };
    
    const Icon = attachment.type === 'application/vnd.presentation' ? FileSliders : Check;

    return (
        <div 
            onClick={handleAction}
            className="w-full mt-3 p-4 rounded-xl bg-zinc-700/50 hover:bg-zinc-700 transition-colors cursor-pointer flex items-center justify-between shadow-inner"
        >
            <div className="flex items-center gap-4">
                 <Icon className="h-5 w-5 text-zinc-300" />
                 <span className="font-semibold text-zinc-100 truncate">{attachment.name}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-400" />
        </div>
    )
};


const MediaAttachment = ({ attachment, attachments }: { attachment?: Message['attachment'], attachments?: Message['attachments'] }) => {
    const allAttachments = attachments || (attachment ? [attachment] : []);
    
    if (allAttachments.length === 0 || allAttachments.some(a => a.type === 'application/vnd.presentation')) return null;

    const renderAttachment = (att: Message['attachment'], index: number) => {
        if (!att.url) return null;
        if (att.type.startsWith("image/")) {
            return (
                <div 
                    key={index}
                    className={cn(
                        "relative w-48 h-36 bg-zinc-700 rounded-2xl overflow-hidden shadow-lg border-2 border-zinc-600 transition-all duration-300",
                        allAttachments.length > 1 && index === 0 && "z-10 -rotate-3 hover:-rotate-6",
                        allAttachments.length > 1 && index === 1 && "z-0 left-8 top-2 rotate-3 hover:rotate-6",
                        allAttachments.length === 1 && "-rotate-2 hover:-rotate-3"
                    )}
                    style={{
                        position: allAttachments.length > 1 ? 'absolute' : 'relative',
                        left: index === 1 ? '2rem' : undefined,
                        top: index === 1 ? '0.5rem' : undefined,
                    }}
                >
                    <Image src={att.url} alt={att.name} layout="fill" objectFit="cover" />
                </div>
            );
        }
        
        if (att.type.startsWith("audio/")) {
            return (
                 <audio key={index} controls src={att.url} className="w-full">
                    Your browser does not support the audio element.
                </audio>
            );
        }
    
        if (att.type.startsWith("video/")) {
            return <VideoPlayer key={index} url={att.url} />;
        }
    
        return (
            <a key={index} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white/70 lucide lucide-file"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                <p className="text-xs font-medium truncate">{att.name}</p>
            </a>
        );
    }

    return (
        <div className={cn("mb-2", allAttachments.length > 1 && "relative h-44 w-64")}>
            {allAttachments.map(renderAttachment)}
        </div>
    );
};

const MemoizedMessageBubble = ({ message, onRegenerate, onDownloadPresentation }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const { toast } = useToast();
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({ title: "Copiado!", description: "A resposta da IA foi copiada para a área de transferência." });
  };
  
  const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
      const [isCopied, setIsCopied] = useState(false);
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, "");

      const handleBlockCopy = () => {
        navigator.clipboard.writeText(codeString);
        setIsCopied(true);
        toast({ title: "Copiado!", description: "O bloco de código foi copiado." });
        setTimeout(() => setIsCopied(false), 2000);
      };

      return !inline && match ? (
        <div className="relative my-2 rounded-lg bg-black/30 font-mono text-sm">
           <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
            <span className="text-xs text-white/50">{match[1]}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleBlockCopy}>
              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <SyntaxHighlighter 
                style={vscDarkPlus} 
                language={match[1]} 
                PreTag="div" 
                {...props}
                customStyle={{ 
                    margin: 0, 
                    padding: '1rem', 
                    backgroundColor: 'transparent', 
                    borderRadius: '0 0 0.5rem 0.5rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                }}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        </div>
      ) : (
        <code className="bg-muted/50 px-1 py-0.5 rounded-md" {...props}>
          {children}
        </code>
      );
  };
  
  const bubbleContent = (
    <>
      <MediaAttachment attachment={message.attachment} attachments={message.attachments} />
      {message.content ? (
         <div className={cn(
           "prose prose-sm max-w-none prose-p:text-current prose-p:leading-relaxed prose-strong:text-current prose-headings:text-current",
           !isUser ? colorSettings.aiText : colorSettings.userBubbleText
         )}>
          <ReactMarkdown components={{ code: CodeBlock }}>
            {message.content}
          </ReactMarkdown>
        </div>
      ) : null}

       {message.status && <StatusIndicator status={message.status} />}
       
       {!isUser && message.attachment?.type === 'application/vnd.presentation' && (
           <ActionableAttachment attachment={message.attachment} onDownloadPresentation={onDownloadPresentation} />
       )}
       {!isUser && !message.content && !message.attachment && !message.attachments && !message.status &&(
            <p className="text-muted-foreground italic">Resposta vazia</p>
       )}
    </>
  );

  return (
    <div className={cn("flex w-full items-start gap-4", isUser ? "justify-end" : "justify-start")}>
        <div className={cn("group flex flex-col gap-1 w-auto max-w-[85%] sm:max-w-[75%]", isUser ? "items-end" : "items-start")}>
            {isUser ? (
                <div className={cn("rounded-2xl p-4 text-sm animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-300", colorSettings.userBubbleBackground)}>
                    {bubbleContent}
                </div>
            ) : (
                <div className="w-full p-1 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    {bubbleContent}
                </div>
            )}
        </div>
    </div>
  );
}

export const MessageBubble = React.memo(MemoizedMessageBubble);
