
'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface ColorPickerProps {
    color: string; // Expects HSL string "H S% L%"
    onChange: (color: string) => void;
}

const predefinedColors = [
    // Cinzas
    "0 0% 96.1%", "0 0% 85%", "0 0% 75%", "0 0% 65%", "0 0% 55%", "0 0% 45%", "0 0% 35%", "0 0% 25%", "0 0% 15%", "0 0% 5%",
    // Vermelhos
    "0 84.2% 60.2%", "0 72.2% 50.6%", "0 62% 45%", "0 90% 70%", "0 80% 65%",
    // Laranjas
    "24 9.8% 10%", "20 80% 55%", "30 90% 60%", "40 95% 50%", "50 100% 50%",
    // Verdes
    "60 9.1% 97.8%", "70 80% 45%", "90 70% 50%", "120 60% 50%", "140 60% 40%",
    // Azuis
    "210 40% 96.1%", "222.4 84% 4.9%", "200 80% 50%", "220 70% 60%", "240 60% 65%",
    // Roxo/Rosa
    "260 70% 60%", "280 80% 65%", "300 85% 60%", "330 90% 70%", "350 95% 65%"
];

export function ColorPicker({ color, onChange }: ColorPickerProps) {
    const isDefaultColor = !color || color.trim() === "";

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center transition-all border-2",
                        isDefaultColor ? "border-dashed border-zinc-600 hover:border-zinc-400" : "border-transparent"
                    )}
                    style={{ backgroundColor: isDefaultColor ? 'transparent' : `hsl(${color})` }}
                >
                    {isDefaultColor ? (
                        <Plus className="h-4 w-4 text-zinc-500" />
                    ) : (
                         <div className="h-full w-full rounded-full ring-2 ring-inset ring-black/20" />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 border-zinc-800 bg-zinc-900">
                <div className="grid grid-cols-5 gap-1">
                    {predefinedColors.map(c => (
                        <button 
                            key={c} 
                            onClick={() => onChange(c)} 
                            className={cn(
                                "h-8 w-8 rounded-md border border-white/10 transition-transform hover:scale-110 hover:z-10 focus:z-10",
                                color === c && "ring-2 ring-white"
                            )}
                            style={{ backgroundColor: `hsl(${c})`}} 
                        />
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
