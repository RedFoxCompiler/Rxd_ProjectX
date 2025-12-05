'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const LOGO_URL = 'https://raw.githubusercontent.com/RedFoxCompiler/NyxAIProject001/refs/heads/main/1000562883-removebg-preview.png';

interface PlushyeProps {
  size?: number; // Size is now optional and might not be used directly
  className?: string;
}

export function Plushye({ className }: PlushyeProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className={cn("relative w-full h-full", className)} // Occupies parent's space
    >
      {isLoading && (
        <div className="absolute inset-0 bg-secondary/50 rounded-full animate-pulse" />
      )}
      <Image
        src={LOGO_URL}
        alt="Nyx AI Logo"
        layout="fill" // Fill the parent div
        objectFit="contain" // Ensure the logo scales correctly
        onLoad={() => setIsLoading(false)}
        className={cn(
          "transition-opacity duration-300 grayscale",
          isLoading ? "opacity-0" : "opacity-100"
        )}
      />
      {/* Camada transparente para bloquear interações */}
      <div className="absolute inset-0 w-full h-full" />
    </div>
  );
}
