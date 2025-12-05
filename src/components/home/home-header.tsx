
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, User } from 'lucide-react';
import { useUser } from '@/firebase';
import { Plushye } from '../logo/plushye';

export function HomeHeader() {
    const { user } = useUser();

    return (
        <header className="fixed top-0 left-0 right-0 z-20 flex h-16 w-full items-center justify-between px-4 md:px-6 backdrop-blur-sm bg-black/10">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-zinc-200">
                <Plushye className="w-8 h-8" />
                Nyx AI
            </Link>
            <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-white">
                    <Link href="/settings">
                        <Settings className="h-5 w-5" />
                    </Link>
                </Button>
                <Avatar className="h-9 w-9 flex-shrink-0">
                    {user?.photoURL ? (
                        <AvatarImage
                            src={user.photoURL}
                            alt={user.displayName || 'User Avatar'}
                        />
                    ) : (
                        <AvatarFallback className="bg-zinc-700">
                            <User className='text-zinc-300' />
                        </AvatarFallback>
                    )}
                </Avatar>
            </div>
        </header>
    );
}
