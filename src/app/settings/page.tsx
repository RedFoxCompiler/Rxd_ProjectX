'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-screen bg-background p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <Button asChild variant="outline">
          <Link href="/chat">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Chat
          </Link>
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-xl">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Em Construção!</h2>
          <p className="text-muted-foreground mt-2">
            Esta página de configurações avançadas estará disponível em breve.
          </p>
        </div>
      </div>
    </div>
  );
}
