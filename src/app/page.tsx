
'use server';

import Link from 'next/link';
import { Suspense } from 'react';
import {
  FileText,
  MessageSquare,
  Sparkles,
  FileSliders,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HomeHeader } from '@/components/home/home-header';
import { HomeQuickChat } from '@/components/home/home-quick-chat';
import { QuickToolCard, QuickToolCardProps } from '@/components/home/quick-tool-card';
import { RecentConversations } from '@/components/home/recent-conversations';


function RecentConversationsFallback() {
    return (
        <div className="space-y-3">
            <div className="h-14 w-full rounded-lg bg-white/5 animate-pulse" />
            <div className="h-14 w-full rounded-lg bg-white/5 animate-pulse" />
            <div className="h-14 w-full rounded-lg bg-white/5 animate-pulse" />
        </div>
    );
}

export default async function HomePage() {
  const tools: QuickToolCardProps[] = [
    {
      icon: 'ImageIcon',
      title: 'Gerar Imagem',
      description: 'Crie visuais a partir de texto.',
      href: '/chat?prompt=/image%20',
      color: 'from-blue-500/10 to-blue-500/20',
    },
    {
      icon: 'Clapperboard',
      title: 'Gerar Vídeo',
      description: 'Dê vida às suas ideias com vídeo.',
      href: '/chat?prompt=/video%20',
      color: 'from-purple-500/10 to-purple-500/20',
    },
    {
      icon: 'FileSliders',
      title: 'Criar Apresentação',
      description: 'Transforme tópicos em slides.',
      href: '/chat?prompt=/presentation%20',
      color: 'from-amber-500/10 to-amber-500/20',
    },
     {
      icon: 'FileText',
      title: 'Analisar Documento',
      description: 'Extraia insights de arquivos.',
      href: '/chat',
      color: 'from-green-500/10 to-green-500/20',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-black text-zinc-200">
      <div className="animated-gradient-background" />

      <HomeHeader />

      <main className="mx-auto max-w-7xl px-4 pt-28 pb-16">
        <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400 animate-fade-in-up animated-text-gradient">
                Onde a criatividade começa.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-zinc-400 animate-fade-in-up animation-delay-300">
                Comece uma conversa, use uma ferramenta ou continue de onde parou.
            </p>
        </div>

        <div className="mb-12 animate-fade-in-up animation-delay-500">
            <HomeQuickChat />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold text-zinc-300 flex items-center gap-2">
              <Sparkles className="text-destructive" />
              Ferramentas Rápidas
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {tools.map(tool => (
                <QuickToolCard
                  key={tool.title}
                  icon={tool.icon}
                  title={tool.title}
                  description={tool.description}
                  href={tool.href}
                  color={tool.color}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold text-zinc-300 flex items-center gap-2">
              <MessageSquare className="text-destructive" />
              Conversas Recentes
            </h2>
            <Suspense fallback={<RecentConversationsFallback />}>
              <RecentConversations />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
