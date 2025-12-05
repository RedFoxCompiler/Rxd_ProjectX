
'use client';

import * as React from 'react';
import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Globe } from 'lucide-react';
import { getRouteStatus } from '@/lib/route-status-actions';
import MaintenancePage from '@/components/maintenance-page';

export default function WebSearchPage() {
  const [inputValue, setInputValue] = useState<string>('');
  // URL especial do Google que permite ser incorporada em iframes.
  const [urlToLoad, setUrlToLoad] = useState<string>('https://www.google.com/webhp?igu=1');
  const [routeStatus, setRouteStatus] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    getRouteStatus().then(status => setRouteStatus(status.routes.websearch));
  }, []);


  const handleSearch = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    // Regex para checar se o input é uma URL válida
    const isUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(trimmedInput);
    
    if (isUrl) {
      // Se já for uma URL, adiciona http:// se necessário
      const fullUrl = trimmedInput.startsWith('http') ? trimmedInput : `https://${trimmedInput}`;
      setUrlToLoad(fullUrl);
    } else {
      // Senão, cria uma URL de pesquisa do Google usando a versão compatível com iframe.
      setUrlToLoad(`https://www.google.com/search?q=${encodeURIComponent(trimmedInput)}&igu=1`);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (routeStatus === false) {
    return <MaintenancePage />;
  }

  if (routeStatus === null) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground p-4 gap-4">
      <Card>
        <CardContent className="p-4 flex items-center gap-2">
          <div className="relative flex-grow">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pesquise no Google ou digite uma URL..."
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Ir
          </Button>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardContent className="p-0 h-full">
          {urlToLoad ? (
            <iframe
              src={urlToLoad}
              title="Web Search"
              className="w-full h-full border-0 rounded-lg"
              // Sandbox para segurança, mas permite scripts e a mesma origem para funcionar melhor
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Digite uma URL ou termo de pesquisa para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
