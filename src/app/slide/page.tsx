
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getRouteStatus } from '@/lib/route-status-actions';
import MaintenancePage from '@/components/maintenance-page';

export default function SlideGeneratorRedirectPage() {
  const router = useRouter();
  const [routeStatus, setRouteStatus] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    getRouteStatus().then(status => setRouteStatus(status.routes.slide));
  }, []);

  React.useEffect(() => {
    if (routeStatus === true) {
      router.replace('/chat');
    }
  }, [routeStatus, router]);

  if (routeStatus === false) {
    return <MaintenancePage />;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-muted-foreground">Redirecionando...</p>
    </div>
  );
}
