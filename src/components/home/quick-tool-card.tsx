
'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

export interface QuickToolCardProps {
  icon: keyof typeof LucideIcons;
  title: string;
  description: string;
  href: string;
  color: string;
}

export function QuickToolCard({ icon, title, description, href, color }: QuickToolCardProps) {
  const IconComponent = LucideIcons[icon] as React.ElementType;

  return (
    <Link href={href}>
      <div className={cn(
        "group relative block h-full w-full p-4 rounded-2xl overflow-hidden",
        "bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm",
        "transition-all duration-300 ease-in-out hover:border-white/20"
      )}>
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className={cn(
              "mb-4 w-fit p-3 rounded-lg bg-gradient-to-br",
              color
            )}>
              {IconComponent && <IconComponent className="h-6 w-6 text-white" />}
            </div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
          </div>
          <ArrowUpRight className="absolute top-4 right-4 h-5 w-5 text-zinc-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </div>
    </Link>
  );
}
