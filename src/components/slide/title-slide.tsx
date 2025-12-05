
'use client';

import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { TitleSlideDesign } from './content-slide';

interface TitleSlideProps {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  design: TitleSlideDesign;
}

export function TitleSlide({ title, subtitle, imageUrl, design }: TitleSlideProps) {
    const isLoading = !imageUrl && subtitle; 

    return (
         <div 
            className="relative w-full h-full aspect-[16/9] rounded-lg overflow-hidden flex flex-col justify-center items-center text-white p-12 text-center shadow-lg"
            style={design.container.styles}
        >
            {isLoading && <Loader2 className="h-8 w-8 animate-spin text-zinc-500 absolute z-10" />}
            
            {imageUrl && <Image src={imageUrl} alt={title} layout="fill" objectFit="cover" className="absolute inset-0 z-0" />}
             
            <div className="absolute inset-0 z-10" style={design.backgroundOverlay.styles} />

            <div className="relative z-20 w-full max-w-4xl space-y-6 animate-in fade-in duration-700">
                <h1 style={design.title.styles}>{title}</h1>
                <p style={design.subtitle.styles}>{subtitle}</p>
            </div>
        </div>
    );
}
