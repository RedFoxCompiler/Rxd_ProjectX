
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, LogOut, Trash2, Pencil, Check, X, User, Shield } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import type { WithId } from '@/firebase';
import { collection, query, orderBy, Timestamp, doc } from 'firebase/firestore';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { TooltipProvider } from '../ui/tooltip';

interface Chat {
  id: string;
  title: string;
  createdAt: Timestamp;
  userId: string;
}

interface ChatSidebarProps {
  onNewChat: () => void;
}

const ADMIN_EMAILS = ['leo922874@gmail.com', 'leonardolima85486@aluno.seduc.to.gov.br'];

function ChatListItem({ item, isActive, onRename, onDelete }: {
    item: WithId<Chat>;
    isActive: boolean;
    onRename: (chatId: string, newTitle: string) => void;
    onDelete: (chatId: string) => void;
}) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [title, setTitle] = React.useState(item.title);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const { setOpenMobile } = useSidebar();

    const handleRename = () => {
        if (title.trim() && title.trim() !== item.title) {
            onRename(item.id, title.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleRename();
        else if (e.key === 'Escape') {
            setTitle(item.title);
            setIsEditing(false);
        }
    };

    return (
        <SidebarMenuItem>
             {isEditing ? (
                <div className="flex items-center w-full gap-1 p-1">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleRename}
                        className="h-8 flex-1 bg-zinc-800 border-zinc-700 focus-visible:ring-1 focus-visible:ring-ring text-sm"
                        autoFocus
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRename}><Check className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /></Button>
                </div>
             ) : (
                <>
                    <Link href={`/chat?id=${item.id}`} className="w-full" passHref>
                        <SidebarMenuButton
                            isActive={isActive}
                            onClick={() => setOpenMobile(false)}
                            className="h-10 justify-start"
                        >
                            <span className='truncate'>{item.title}</span>
                        </SidebarMenuButton>
                    </Link>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/50 rounded-md">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsDeleting(true)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </>
             )}
            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>Esta ação não pode ser desfeita. Isso excluirá permanentemente esta conversa.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={() => onDelete(item.id)}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SidebarMenuItem>
    );
}

export function ChatSidebar({ onNewChat }: ChatSidebarProps) {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setOpenMobile } = useSidebar();
  const activeChatId = searchParams.get('id');
  const { toast } = useToast();

  const chatsColRef = useMemoFirebase(() => {
    if (!firestore || !user || user.isAnonymous) return null;
    return collection(firestore, 'users', user.uid, 'conversations');
  }, [firestore, user]);

  const chatsQuery = useMemoFirebase(() => {
    if (!chatsColRef) return null;
    return query(chatsColRef, orderBy('createdAt', 'desc'));
  }, [chatsColRef]);

  const { data: chatHistory, isLoading: isHistoryLoading } = useCollection<Chat>(chatsQuery);

  const handleSignOut = () => signOut(auth).then(() => router.push('/'));
  
  const handleDeleteChat = (chatId: string) => {
    if (!firestore || !user) return;
    const chatDocRef = doc(firestore, 'users', user.uid, 'conversations', chatId);
    deleteDocumentNonBlocking(chatDocRef);
    toast({ title: "Conversa excluída" });
    if (activeChatId === chatId) router.push('/chat');
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    if (!firestore || !user) return;
    const chatDocRef = doc(firestore, 'users', user.uid, 'conversations', chatId);
    updateDocumentNonBlocking(chatDocRef, { title: newTitle });
    toast({ title: "Conversa renomeada" });
  };
  
  const handleNewChatClick = () => {
      setOpenMobile(false);
      onNewChat();
  }

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
  const userPhoto = user?.photoURL || '';

  return (
     <TooltipProvider>
        <Sidebar className="bg-zinc-900 border-r-0" collapsible="offcanvas" side="left">
          <SidebarHeader className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
             <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9 flex-shrink-0">
                {userPhoto ? (
                    <AvatarImage
                      src={userPhoto}
                      alt={user?.displayName || 'User Avatar'}
                    />
                ) : (
                    <AvatarFallback className="bg-zinc-700">
                      <User className='text-zinc-300' />
                    </AvatarFallback>
                )}
                </Avatar>
                <div className="flex-shrink min-w-0">
                    <p className="font-semibold text-zinc-200 truncate">
                        {user?.displayName || 'Usuário'}
                    </p>
                </div>
            </div>
          </SidebarHeader>
            
          <div className="p-4">
             <Button
                onClick={handleNewChatClick}
                variant="outline"
                className="h-11 w-full justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700"
            >
                <Pencil className="mr-2 h-4 w-4" />
                <span>Nova Conversa</span>
            </Button>
          </div>

          <SidebarContent className="p-2 pt-0">
            <div className="px-2 pb-2 text-xs font-semibold text-zinc-500">
              HISTÓRICO
            </div>
            <SidebarMenu>
              {isHistoryLoading && (
                <div className="p-2 text-sm text-zinc-400">
                  Carregando...
                </div>
              )}
              {chatHistory?.map((item) => (
                <ChatListItem
                  key={item.id}
                  item={item}
                  isActive={activeChatId === item.id}
                  onDelete={handleDeleteChat}
                  onRename={handleRenameChat}
                />
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-zinc-800 p-2">
            <SidebarMenu>
              {isAdmin && (
                  <SidebarMenuItem>
                    <Link href="/adminsettings" passHref>
                        <SidebarMenuButton variant="ghost" className="h-9 justify-start text-destructive hover:text-destructive">
                            <Shield />
                            <span>Painel de Admin</span>
                        </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    variant="ghost"
                    className="h-9 justify-start text-zinc-400 hover:text-white"
                  >
                    <Settings/>
                    <span>Opções da Conta</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 mb-2 ml-2 bg-zinc-800 border-zinc-700 text-zinc-200"
                  side="top"
                  align="start"
                >
                  <DropdownMenuItem asChild className='cursor-pointer focus:bg-zinc-700 focus:text-white'>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className='bg-zinc-700' />
                  <DropdownMenuItem onClick={handleSignOut} className='cursor-pointer focus:bg-zinc-700 focus:text-white'>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </TooltipProvider>
  );
}

    