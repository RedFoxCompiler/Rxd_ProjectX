
'use client';

import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export type TaskStatus = {
    state: 'loading' | 'progress' | 'success' | 'error';
    label: string;
    progress?: number; // Optional, for 'progress' state
}

interface StatusIndicatorProps {
    status: TaskStatus;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    const renderIcon = () => {
        switch (status.state) {
            case 'loading':
                return <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />;
            case 'progress':
                 return (
                    <div className="relative h-4 w-4">
                        <div className="absolute inset-0 rounded-full border-2 border-zinc-500" />
                        <div 
                            className="absolute inset-0 rounded-full bg-zinc-400" 
                            style={{ clipPath: `inset(0 ${100 - (status.progress || 0)}% 0 0)` }} 
                        />
                    </div>
                 );
            case 'success':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-destructive" />;
            default:
                return null;
        }
    };

    return (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-zinc-800/50 p-2 text-xs text-zinc-400">
            {renderIcon()}
            <span>{status.label}</span>
        </div>
    );
};
