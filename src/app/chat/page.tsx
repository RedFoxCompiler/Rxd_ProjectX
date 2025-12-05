
'use client';

import * as React from 'react';
import { useUser } from '@/firebase';
import { Chat } from "@/components/chat/chat";
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { ChatHeader } from '@/components/chat/chat-header';
import { getRouteStatus } from '@/lib/route-status-actions';
import MaintenancePage from '@/components/maintenance-page';

export default function ChatPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [routeStatus, setRouteStatus] = React.useState<boolean | null>(null);
  
  const isNewUser = user && !user.isAnonymous && !user.displayName;
  const [isNameSetupComplete, setIsNameSetupComplete] = React.useState(!isNewUser);

  React.useEffect(() => {
    setIsNameSetupComplete(user ? !(!user.isAnonymous && !user.displayName) : false);
  }, [user]);

  React.useEffect(() => {
    getRouteStatus().then(status => setRouteStatus(status.routes.chat));
  }, []);

  const showMainUI = !isNewUser || isNameSetupComplete;

  const handleNewChat = () => {
    router.push('/chat');
  };
  
  if (routeStatus === false) {
    return <MaintenancePage />;
  }

  // Render loading or null while checking status
  if (routeStatus === null) {
      return null;
  }

  return (
    <SidebarProvider>
      <div className="relative h-screen w-full flex flex-col bg-black">
        <div className="animated-gradient-background" />
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
            <ChatHeader />
            <div className="flex-1 flex flex-row overflow-hidden">
                <ChatSidebar onNewChat={handleNewChat} />
                <main className="flex-1 flex flex-col h-full w-full overflow-hidden">
                  <Chat 
                      isNewUser={isNewUser || false}
                      isUserLoading={isUserLoading}
                      onNameSetupComplete={() => setIsNameSetupComplete(true)}
                      showMainUI={showMainUI}
                  />
                </main>
            </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
