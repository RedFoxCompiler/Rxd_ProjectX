'use client';

import { Button } from '@/components/ui/button';
import { Download, Home, Loader2 } from 'lucide-react';
import { useState } from 'react';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// O componente de UI permanece um client component
export function DownloadClientPage({ files }: { files: Record<string, string> }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    toast({
        title: 'Preparando Download...',
        description: 'Estamos compactando todos os arquivos do projeto. Isso pode levar um momento.',
    });
    try {
      const zip = new JSZip();
      
      for (const filePath in files) {
        // Adiciona cada arquivo ao zip com sua estrutura de pasta correta
        zip.file(filePath, files[filePath]);
      }

      const zipContent = await zip.generateAsync({ type: 'blob' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipContent);
      link.download = 'nyx-ai-project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast({
        title: 'Download Iniciado',
        description: 'O arquivo .zip do projeto completo está sendo baixado.',
      });

    } catch (error) {
      console.error('Failed to create zip file', error);
      toast({
        variant: 'destructive',
        title: 'Erro no Download',
        description: 'Não foi possível gerar o arquivo .zip.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Download Completo do Projeto</CardTitle>
          <CardDescription>
            Clique no botão abaixo para baixar o código-fonte completo da aplicação, incluindo toda a estrutura de pastas e um arquivo de instruções (INSTRUCOES.md), em um único arquivo .zip.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={handleDownload} disabled={isDownloading} size="lg" className="w-full">
            {isDownloading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Download className="mr-2 h-5 w-5" />
            )}
            Baixar Projeto Completo (.zip)
          </Button>
           <Button asChild variant="outline">
                <Link href="/chat">
                    <Home className="mr-2 h-4 w-4" /> Voltar para o Chat
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
