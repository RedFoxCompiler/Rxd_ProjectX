
'use client';

import * as React from 'react';
import { getRouteStatus } from '@/lib/route-status-actions';
import MaintenancePage from '@/components/maintenance-page';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Palette } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CreativeTool {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  status: 'available' | 'soon';
}

const tools: CreativeTool[] = [
  {
    title: "Chat UI Designer",
    description: "Crie e visualize temas de cores para a interface do chat usando IA.",
    icon: Palette,
    href: "/create/chat-designer",
    status: 'soon',
  },
  // Futuras ferramentas podem ser adicionadas aqui
];

const CreativeToolCard = ({ tool }: { tool: CreativeTool }) => {
    const router = useRouter();

    const handleClick = () => {
        if (tool.status === 'available') {
            router.push(tool.href);
        }
    };

    return (
        <Card 
            className={cn(
                "group relative overflow-hidden bg-zinc-900/50 hover:bg-zinc-900/80 border-zinc-800 transition-all duration-300",
                tool.status === 'available' ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
            )}
            onClick={handleClick}
        >
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-zinc-800 rounded-lg mb-4 border border-zinc-700">
                        <tool.icon className="h-6 w-6 text-destructive" />
                    </div>
                    {tool.status === 'soon' && (
                        <span className="text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5">
                            Em Breve
                        </span>
                    )}
                </div>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
        </Card>
    );
};


export default function CreateHubPage() {
  const [routeStatus, setRouteStatus] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    getRouteStatus().then(status => setRouteStatus(status.routes.create));
  }, []);

  if (routeStatus === false) {
    return <MaintenancePage />;
  }

  if (routeStatus === null) {
    return null; // ou um loader
  }

  return (
    <div className="flex h-screen w-full flex-col bg-black text-white">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 px-4 md:px-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon" className="h-9 w-9 border-zinc-700 bg-zinc-900 hover:bg-zinc-800">
                    <Link href="/chat">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold text-zinc-200">Central Criativa</h1>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map(tool => (
                    <CreativeToolCard key={tool.title} tool={tool} />
                ))}
            </div>
        </main>
    </div>
  );
}
