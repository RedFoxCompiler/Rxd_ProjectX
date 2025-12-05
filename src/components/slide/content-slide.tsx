
'use client';

import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { Icon } from '@/lib/icons';
import type { SlideData } from '@/lib/types';
import React, { CSSProperties } from 'react';

// Tipos para o design do slide
export interface ElementDesign {
  styles: CSSProperties;
}

export interface ContentSlideDesign {
  container: ElementDesign;
  title: ElementDesign;
  content: ElementDesign;
  icon: ElementDesign;
  imageContainer?: ElementDesign;
}

export interface TitleSlideDesign {
    container: ElementDesign;
    title: ElementDesign;
    subtitle: ElementDesign;
    backgroundOverlay: ElementDesign;
}

export interface SlideDesign {
    titleSlide: TitleSlideDesign;
    contentSlides: ContentSlideDesign[];
}

interface ContentSlideProps {
  slide: SlideData;
  imageUrl: string | null;
  design: ContentSlideDesign;
}

export function ContentSlide({ slide, imageUrl, design }: ContentSlideProps) {
    return (
        <div 
            className="relative w-full h-full aspect-[16/9] rounded-lg overflow-hidden p-12 shadow-lg flex items-center justify-center"
            style={design.container.styles}
        >
            <div className="grid grid-cols-12 grid-rows-6 gap-x-8 w-full h-full z-10">

                {/* IMAGEM */}
                {imageUrl && (
                     <div className="col-start-8 col-span-5 row-start-1 row-span-4 flex items-start justify-end pt-4" style={design.imageContainer?.styles}>
                        <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl bg-zinc-800">
                             <Image src={imageUrl} alt={slide.title} layout="fill" objectFit="cover" className="transform transition-transform duration-500 hover:scale-105" />
                        </div>
                    </div>
                )}
               
                {/* ÍCONE DECORATIVO */}
                <div className="col-start-1 col-span-2 row-start-1 flex items-start">
                    <Icon name={slide.iconName} style={design.icon.styles} />
                </div>


                {/* TÍTULO */}
                <div className="col-start-1 col-span-7 row-start-2 row-span-2 flex flex-col justify-center">
                    <h2 style={design.title.styles}>
                        {slide.title}
                    </h2>
                </div>

                {/* CONTEÚDO */}
                <div className="col-start-1 col-span-7 row-start-4 row-span-2">
                    {slide.content && (
                        <div className="prose prose-xl max-w-none space-y-3" style={design.content.styles}>
                            {slide.content.split('\n').map((item, i) => item.trim() && (
                                <p key={i} className="m-0">{item.replace(/^-/, '• ').trim()}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
