
'use client';

import { Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MaintenancePage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black p-4 text-center">
      <Wrench className="h-16 w-16 animate-pulse text-destructive" />
      <h1 
        className={cn(
            "mt-8 text-4xl font-bold tracking-tight text-transparent sm:text-6xl",
            "bg-gradient-to-r from-zinc-200 via-destructive to-zinc-200 bg-clip-text"
        )}
      >
        Em Manutenção
      </h1>
      <p className="mt-4 text-lg text-zinc-400">
        Voltaremos em breve!
      </p>
    </div>
  );
}
