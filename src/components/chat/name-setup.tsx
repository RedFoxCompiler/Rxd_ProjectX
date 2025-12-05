'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NameSetupProps {
  onNameSet: (name: string) => void;
}

export function NameSetup({ onNameSet }: NameSetupProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isLoading || isSaved) return;
    
    setIsLoading(true);

    // Simulate a quick save operation then show success
    setTimeout(() => {
        setIsLoading(false);
        setIsSaved(true);
        toast({
            title: "Salvo com sucesso!",
            description: "Seu nome foi salvo. Bem-vindo(a)!",
        });
        
        // Actually call the save function
        onNameSet(trimmedName);

        // The parent component will handle the UI transition
    }, 500);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 animate-in fade-in duration-500">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Bem-vindo(a)!</CardTitle>
            <CardDescription>Como a IA deve te chamar? Este nome será usado nas conversas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome aqui..."
              disabled={isLoading || isSaved}
              autoFocus
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading || isSaved || !name.trim()}>
              {isSaved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Salvo com sucesso
                </>
              ) : isLoading ? (
                'Salvando...'
              ) : (
                'Salvar e Continuar'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
