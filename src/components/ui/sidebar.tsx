
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { VariantProps, cva } from 'class-variance-authority';
import { PanelLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '20rem'; // Expanded sidebar width
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '5rem'; // 80px
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContext = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ defaultOpen = false, open: openProp, onOpenChange: setOpenProp, ...props }, ref) => {
  const isMobile = useIsMobile() ?? false; // Default to false SSR
  const [openMobile, setOpenMobile] = React.useState(false);

  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );
  
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((v) => !v) : setOpen((v) => !v);
  }, [isMobile, setOpen, setOpenMobile]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContext>(
    () => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );

  return <SidebarContext.Provider value={contextValue}><div ref={ref} {...props} /></SidebarContext.Provider>;
});
SidebarProvider.displayName = 'SidebarProvider';

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    side?: 'left' | 'right';
    collapsible?: 'offcanvas' | 'icon' | 'none';
  }
>(({ side = 'left', collapsible = 'offcanvas', className, children, ...props }, ref) => {
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    if (collapsible === 'none') return null;
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          side={side}
          className={cn("w-[--sidebar-width] p-0 text-foreground border-r-0", className)}
          style={{ '--sidebar-width': SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar Menu</SheetTitle>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  const wrapperClasses = cn(
    "relative hidden h-full flex-col transition-[width] duration-200 ease-in-out md:flex",
    open ? 'w-[--sidebar-width]' : (collapsible === 'icon' ? 'w-[--sidebar-width-icon]' : 'w-0'),
    side === 'left' ? 'border-r' : 'border-l',
    className
  );
  
  if (collapsible === 'none') {
      return (
          <aside 
            ref={ref} 
            className={cn("h-full flex-col md:flex", className)}
            style={{ '--sidebar-width': SIDEBAR_WIDTH } as React.CSSProperties}
            {...props}
          >
              {children}
          </aside>
      )
  }

  return (
    <aside
      ref={ref}
      data-state={open ? 'expanded' : 'collapsed'}
      style={{
        '--sidebar-width': SIDEBAR_WIDTH,
        '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
      } as React.CSSProperties}
      className={wrapperClasses}
      {...props}
    >
      {children}
    </aside>
  );
});
Sidebar.displayName = 'Sidebar';


const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = 'SidebarTrigger';

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-2 p-2', className)} {...props} />
  )
);
SidebarHeader.displayName = 'SidebarHeader';

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto', className)} {...props} />
  )
);
SidebarContent.displayName = 'SidebarContent';

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-auto flex flex-col gap-2 p-2', className)} {...props} />
  )
);
SidebarFooter.displayName = 'SidebarFooter';

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props} />
  )
);
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('group/menu-item relative', className)} {...props} />
  )
);
SidebarMenuItem.displayName = 'SidebarMenuItem';

const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-3 overflow-hidden rounded-lg px-3 text-left text-sm outline-none ring-ring transition-all hover:bg-zinc-800 hover:text-zinc-200 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:[--sidebar-width-icon]:w-full [&>span]:group-data-[state=collapsed]:hidden text-zinc-400',
  {
    variants: {
      variant: { default: '' },
      size: {
        default: 'h-9 text-sm',
        sm: 'h-8 text-xs',
        lg: 'h-12 text-sm justify-center group-data-[state=collapsed]:!h-12 group-data-[state=collapsed]:!w-12',
      },
      isActive: { true: 'bg-destructive/10 font-medium text-destructive' },
    },
    defaultVariants: { size: 'default' },
  }
);

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    asChild?: boolean;
    tooltip?: React.ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(({ asChild = false, variant, size, isActive, tooltip, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  const { open, isMobile } = useSidebar();
  const button = (
    <Comp ref={ref} className={cn(sidebarMenuButtonVariants({ variant, size, isActive }), className)} {...props} />
  );
  if (!tooltip) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={open || isMobile} {...tooltip} />
    </Tooltip>
  );
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

export {
  Sidebar, SidebarProvider, useSidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarFooter,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton
};
