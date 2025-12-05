
'use client';

import {
  Camera,
  Clapperboard,
  FileImage,
  Globe,
  PenSquare,
  Sparkles,
  Wand2,
  Plus
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';
import { colorSettings } from './color-settings';

export type Tool = {
  icon: React.ElementType;
  label: string;
  tool?: string;
  href?: string;
  action?: 'camera' | 'file';
};

interface ToolsPanelProps {
  onFileSelect: () => void;
  onCameraSelect: () => void;
  onToolSelect: (tool: Tool) => void;
}

const ALL_TOOLS: Tool[] = [
    { icon: Camera, label: 'Câmera', action: 'camera' },
    { icon: FileImage, label: 'Fototeca', action: 'file' },
    { icon: Sparkles, label: 'Gerar Imagem', tool: '/image' },
    { icon: Clapperboard, label: 'Gerar Vídeo', tool: '/video' },
    { icon: Wand2, label: 'Apresentação', tool: '/presentation' },
    { icon: PenSquare, label: 'Criar', href: '/create' },
    { icon: Globe, label: 'Pesquisa na Web', tool: '/search' },
];


export function ToolsPanel({
  onFileSelect,
  onCameraSelect,
  onToolSelect,
}: ToolsPanelProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToolClick = (tool: Tool) => {
    setIsOpen(false);
    if (tool.action === 'file') {
      onFileSelect();
    } else if (tool.action === 'camera') {
      onCameraSelect();
    } else if(tool.href) {
        router.push(tool.href);
    } else if (tool.tool) {
        onToolSelect(tool);
    }
  };


  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-10 w-10 shrink-0 rounded-full transition-transform duration-300 ease-in-out hover:rotate-[-20deg] active:scale-90',
                colorSettings.inputButton,
                isOpen && '-rotate-45'
              )}
            >
              <Plus className="h-5 w-5" />
            </Button>
        </PopoverTrigger>
        <PopoverContent 
            className="w-auto bg-zinc-800/50 backdrop-blur-xl border-zinc-700 text-white p-2 mb-2 shadow-2xl"
            side="top"
            align="start"
        >
            <div className="grid grid-cols-4 gap-1">
                {ALL_TOOLS.map((tool) => (
                    <button
                        key={tool.label}
                        onClick={() => handleToolClick(tool)}
                        className="flex flex-col items-center justify-center text-center gap-1.5 p-2 rounded-xl hover:bg-zinc-700/70 transition-all active:scale-95 w-20 h-20"
                    >
                       <div className="p-3 bg-zinc-700/50 rounded-full mb-1 border border-white/5">
                            <tool.icon className="w-5 h-5 text-zinc-300" />
                        </div>
                        <p className="text-xs font-medium leading-tight text-zinc-400">{tool.label}</p>
                    </button>
                ))}
            </div>
        </PopoverContent>
    </Popover>
  );
}

    
