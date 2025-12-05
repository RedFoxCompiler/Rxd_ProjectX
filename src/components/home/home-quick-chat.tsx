
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HomeQuickChat() {
    const [input, setInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        router.push(`/chat?prompt=${encodeURIComponent(input)}`);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={cn('animated-border-wrapper rounded-[20px]', isFocused && 'is-focused')}>
                 <div className="relative flex items-center w-full rounded-[19px] bg-black/50 shadow-inner backdrop-blur-sm">
                    <Sparkles className="absolute left-5 h-5 w-5 text-zinc-500" />
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Comece a digitar para conversar com a IA..."
                        className="w-full h-14 bg-transparent pl-14 pr-16 text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="absolute right-3 h-9 w-9 rounded-full bg-destructive text-white transition-transform hover:scale-110 active:scale-95 disabled:bg-zinc-700"
                        disabled={!input.trim()}
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </form>
    );
}
