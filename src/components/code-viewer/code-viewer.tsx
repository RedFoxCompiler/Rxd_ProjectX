'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Copy, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface CodeViewerProps {
  files: Record<string, string>;
}

export function CodeViewer({ files }: CodeViewerProps) {
  const [copiedFile, setCopiedFile] = useState('');
  const { toast } = useToast();
  const fileNames = Object.keys(files);

  const handleCopy = (fileName: string) => {
    navigator.clipboard.writeText(files[fileName]);
    setCopiedFile(fileName);
    toast({
      title: 'Copiado!',
      description: `O conteúdo de ${fileName} foi copiado para a área de transferência.`,
    });
    setTimeout(() => setCopiedFile(''), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto">
       <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Visualizador de Código</h1>
        <div className="flex items-center gap-2">
            <Button asChild variant="outline">
                <Link href="/adminsettings">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Painel
                </Link>
            </Button>
        </div>
      </div>
      <div className="mb-4 p-4 border rounded-lg bg-secondary/50">
        <h2 className="font-semibold text-lg mb-2">Código Fonte Completo</h2>
        <p className="text-sm text-muted-foreground">
          Abaixo está o código-fonte completo da aplicação. Use as abas para navegar entre os arquivos. Para baixar o projeto, volte ao painel de administração.
        </p>
      </div>
      <Tabs defaultValue={fileNames[0]} className="flex-1 flex flex-col">
        <ScrollArea>
            <TabsList>
            {fileNames.map((fileName) => (
                <TabsTrigger key={fileName} value={fileName}>
                {fileName}
                </TabsTrigger>
            ))}
            </TabsList>
        </ScrollArea>

        {fileNames.map((fileName) => (
          <TabsContent key={fileName} value={fileName} className="flex-1 mt-4 relative">
            <ScrollArea className="h-[calc(100vh-21rem)] w-full rounded-md border">
              <pre className="p-4">
                <code>{files[fileName]}</code>
              </pre>
            </ScrollArea>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => handleCopy(fileName)}
            >
              {copiedFile === fileName ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
