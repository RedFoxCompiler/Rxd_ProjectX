
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { colorSettings } from './color-settings';
import { cn } from '@/lib/utils';

const CustomMenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground">
        <path d="M4 8L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M4 12L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M10 16L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform="translate(0, 0)"/>
    </svg>
);


export function ChatHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex h-16 w-full items-center justify-between px-4">
        <div>
            <SidebarTrigger className={cn(
                "h-10 w-10 rounded-full border backdrop-blur-md transition-transform active:scale-90", 
                "focus-visible:ring-0 focus-visible:ring-offset-0", // Remove focus ring
                colorSettings.headerIconBorder, 
                colorSettings.headerIconBackground
            )}>
                <CustomMenuIcon />
            </SidebarTrigger>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 className={cn("text-lg font-medium tracking-wide", colorSettings.headerText)}>Nyx AI</h1>
        </div>

        {/* Placeholder for right-side icons if needed */}
        <div className="w-10"></div>
    </header>
  );
}
