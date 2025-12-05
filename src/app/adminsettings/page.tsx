
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Loader2, Power, Save, ShieldAlert } from 'lucide-react';
import { getRouteStatus, saveRouteStatus, RouteStatus } from '@/lib/route-status-actions';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

// --- Constantes ---
const ADMIN_EMAILS = ['leo922874@gmail.com', 'leonardolima85486@aluno.seduc.to.gov.br'];

function RouteControlPanel() {
    const { toast } = useToast();
    const [statuses, setStatuses] = useState<RouteStatus | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [initialStatuses, setInitialStatuses] = useState<RouteStatus | null>(null);

    useEffect(() => {
        async function loadStatuses() {
            const data = await getRouteStatus();
            setStatuses(data);
            setInitialStatuses(JSON.parse(JSON.stringify(data)));
        }
        loadStatuses();
    }, []);

    const hasChanges = statuses && initialStatuses && JSON.stringify(statuses) !== JSON.stringify(initialStatuses);

    const handleToggle = (route: keyof RouteStatus['routes']) => {
        setStatuses(prev => {
            if (!prev) return null;
            return {
                ...prev,
                routes: {
                    ...prev.routes,
                    [route]: !prev.routes[route],
                },
            };
        });
    };

    const handleSave = async () => {
        if (!statuses) return;
        setIsSaving(true);
        try {
            const result = await saveRouteStatus(statuses);
            if (result.success) {
                setInitialStatuses(JSON.parse(JSON.stringify(statuses)));
                toast({
                    title: "Salvo com sucesso!",
                    description: "O estado das rotas foi atualizado.",
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: "Erro ao salvar",
                    description: result.error || "Não foi possível salvar as alterações.",
                });
            }
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Erro de sistema",
                description: (error as Error).message,
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (!statuses) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-destructive" />
            </div>
        );
    }
    
    const routeOrder: { key: keyof RouteStatus['routes']; label: string; }[] = [
        { key: 'chat', label: '/chat' },
        { key: 'websearch', label: '/websearch' },
        { key: 'create', label: '/create' },
    ];


    return (
        <div className="flex h-screen w-full flex-col bg-black">
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 px-4 md:px-6">
                <div className="flex items-center gap-4">
                     <Button asChild variant="outline" size="icon" className="h-9 w-9 border-zinc-700 bg-zinc-900 hover:bg-zinc-800">
                        <Link href="/chat">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold text-zinc-200">Controle de Rotas</h1>
                </div>
                <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="bg-destructive hover:bg-destructive/90 text-white">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar
                </Button>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                 <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {routeOrder.map(({ key, label }) => {
                        const isActive = statuses.routes[key];
                        return (
                             <button
                                key={key}
                                onClick={() => handleToggle(key)}
                                className={cn(
                                    "group relative aspect-square flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all duration-300",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 ring-offset-black",
                                    isActive ? "bg-zinc-800 hover:bg-zinc-700" : "bg-zinc-900 hover:bg-zinc-800/50"
                                )}
                             >
                                <Power className={cn(
                                    "h-1/3 w-1/3 transition-colors",
                                    isActive ? "text-destructive" : "text-zinc-600 group-hover:text-zinc-500"
                                )} />
                                <span className={cn(
                                    "font-mono text-base font-medium transition-colors",
                                     isActive ? "text-zinc-200" : "text-zinc-500 group-hover:text-zinc-400"
                                )}>{label}</span>
                             </button>
                        )
                    })}
                 </div>
            </main>
        </div>
    )
}

function AccessDenied() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black p-4 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h1 className="mt-8 text-4xl font-bold tracking-tight text-zinc-200">Acesso Negado</h1>
        <p className="mt-4 text-lg text-zinc-400">
            Você não tem permissão para acessar esta página.
        </p>
        <Button asChild variant="outline" className="mt-8 border-zinc-700 bg-zinc-900 hover:bg-zinc-800">
            <Link href="/chat">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Chat
            </Link>
        </Button>
    </div>
  );
}


export default function AdminSettingsPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-destructive" />
      </div>
    );
  }

  const isAuthorized = user && user.email && ADMIN_EMAILS.includes(user.email);

  if (!isAuthorized) {
    return <AccessDenied />;
  }

  return <RouteControlPanel />;
}
