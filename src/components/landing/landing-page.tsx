
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Bot, Code, ImageIcon, Mic, Settings, Search, FileText, Sparkles, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { generateConversationStarter } from '@/ai/flows/generate-conversation-starter';

// --- Componentes da UI ---

const UserHeader = () => {
    const { user } = useUser();
    return (
        <div className="flex items-center justify-between w-full p-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                    <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm text-muted-foreground">Bem-vindo(a) de volta,</p>
                    <h2 className="font-semibold text-lg">{user?.displayName || 'Usuário'}</h2>
                </div>
            </div>
            <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
            </Button>
        </div>
    );
};

const Suggestions = () => {
    const [starter, setStarter] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        generateConversationStarter({})
            .then(res => setStarter(res.starter))
            .catch(() => setStarter('Como posso te ajudar hoje?'))
            .finally(() => setIsLoading(false));
    }, []);


    const suggestions = [
        { icon: ImageIcon, text: 'Gerar uma imagem de um astronauta' },
        { icon: Code, text: 'Criar um script Python para web scraping' },
        { icon: FileText, text: 'Analisar um contrato em PDF' },
    ];
    return (
        <div className="w-full space-y-4 p-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            {isLoading ? (
                 <div className="flex justify-center items-center h-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <Card className="bg-card/50 hover:bg-card/80 transition-colors cursor-pointer border-primary/20 hover:border-primary/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{starter}</p>
                    </CardContent>
                </Card>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.slice(0,2).map((item, index) => (
                    <Card key={index} className="bg-card/50 hover:bg-card/80 transition-colors cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-3">
                            <item.icon className="h-5 w-5 text-muted-foreground/80 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">{item.text}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const ActionToolbar = () => (
     <div className="fixed bottom-0 left-0 right-0 p-4 z-20 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
        <div className="flex items-center justify-center gap-2 p-2 rounded-full bg-card/80 backdrop-blur-sm shadow-2xl ring-1 ring-white/10">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full">
                <Search className="h-6 w-6"/>
            </Button>
            <Button asChild size="icon" className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
                 <Link href="/chat">
                    <Mic className="h-8 w-8 text-primary-foreground" />
                 </Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full">
                <Bot className="h-6 w-6"/>
            </Button>
        </div>
    </div>
);


// --- Componente Principal da Página ---

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground overflow-hidden">
      
      <div className="absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-br from-primary/30 via-secondary/20 to-background/0 opacity-50 blur-3xl -z-10" />

      <main className="relative z-10 flex flex-col items-center flex-1 w-full max-w-4xl mx-auto">
        <UserHeader />
        
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                 <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                    Olá, como posso ajudar?
                </h1>
            </div>
        </div>

        <Suggestions />
      </main>

      <ActionToolbar />

    </div>
  );
}
