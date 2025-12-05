
'use client';

import * as React from 'react';
import { getRouteStatus } from '@/lib/route-status-actions';
import MaintenancePage from '@/components/maintenance-page';
import { useRouter } from 'next/navigation';

// This page is deprecated and will redirect to the chat.
export default function EbookGeneratorPage() {
  const router = useRouter();
  const [routeStatus, setRouteStatus] = React.useState<boolean | null>(null);

   React.useEffect(() => {
    // This check is kept for consistency, but the page will redirect anyway.
    getRouteStatus().then(status => setRouteStatus(status.routes.chat));
  }, []);

  React.useEffect(() => {
    // Always redirect to chat.
    router.replace('/chat');
  }, [router]);
  
  if (routeStatus === false) {
    return <MaintenancePage />;
  }

  return (
     <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-muted-foreground">Redirecionando...</p>
    </div>
  );
}
