
'use client';

import { useUser, useFirestore, useMemoFirebase, useCollection, WithId } from '@/firebase';
import { collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Chat {
  id: string;
  title: string;
  createdAt: Timestamp;
  userId: string;
}

export function RecentConversations() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const chatsColRef = useMemoFirebase(() => {
    if (!firestore || !user || user.isAnonymous) return null;
    return collection(firestore, 'users', user.uid, 'conversations');
  }, [firestore, user]);

  const chatsQuery = useMemoFirebase(() => {
    if (!chatsColRef) return null;
    return query(chatsColRef, orderBy('createdAt', 'desc'), limit(3));
  }, [chatsColRef]);

  const { data: recentConversations, isLoading } = useCollection<Chat>(chatsQuery);

  if (isUserLoading || isLoading) {
     return (
        <div className="space-y-3">
            <div className="h-14 w-full rounded-xl bg-white/5 animate-pulse" />
            <div className="h-14 w-full rounded-xl bg-white/5 animate-pulse" />
            <div className="h-14 w-full rounded-xl bg-white/5 animate-pulse" />
        </div>
    );
  }

  if (!user || user.isAnonymous) {
    return (
      <div className="flex flex-col items-center justify-center h-full rounded-xl bg-white/5 p-4 text-center">
        <p className="text-sm text-zinc-400">Faça login para ver suas conversas recentes aqui.</p>
      </div>
    );
  }

  if (!recentConversations || recentConversations.length === 0) {
     return (
      <div className="flex flex-col items-center justify-center h-full rounded-xl bg-white/5 p-4 text-center">
        <p className="text-sm text-zinc-400">Nenhuma conversa recente encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
        {recentConversations.map(chat => (
            <Link 
                href={`/chat?id=${chat.id}`} 
                key={chat.id} 
                className="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20"
            >
                <span className="truncate text-zinc-300">{chat.title}</span>
                <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
            </Link>
        ))}
    </div>
  );
}
