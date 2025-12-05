
'use client';

import { Sparkles, Loader2 } from 'lucide-react';

interface GreetingScreenProps {
    userName?: string | null;
    starter?: string | null;
}

export function GreetingScreen({ userName, starter }: GreetingScreenProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 -mt-16 animate-in fade-in duration-700">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-white via-destructive to-red-600 bg-clip-text text-transparent">
                Olá, {userName || 'Usuário'}!
            </h1>
        </div>
    );
}
