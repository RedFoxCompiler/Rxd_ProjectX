
'use client';

import { cn } from "@/lib/utils";

const Clip = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.9439 18.2577C12.4496 18.752 11.6499 18.752 11.1556 18.2577L6.44365 13.5458C4.54556 11.6477 4.54556 8.56477 6.44365 6.66667C8.34175 4.76858 11.4247 4.76858 13.3228 6.66667L18.7613 12.1052C19.5539 12.8978 19.5539 14.1641 18.7613 14.9567C17.9687 15.7493 16.7024 15.7493 15.9098 14.9567L11.8964 10.9433" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const Tape = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M0 10C0 4.47715 4.47715 0 10 0H90C95.5228 0 100 4.47715 100 10V40C100 45.5228 95.5228 50 90 50H10C4.47715 50 0 45.5228 0 40V10Z" fill="currentColor" />
        <path d="M10 5L15 0" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5"/>
        <path d="M90 45L85 50" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5"/>
    </svg>
);

const Pin = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="12" cy="8" r="6" fill="currentColor"/>
        <path d="M12 14V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);


const decorationMap = {
    clip: Clip,
    tape: Tape,
    pin: Pin,
};

type DecorationType = keyof typeof decorationMap;

interface DecorationProps extends React.SVGProps<SVGSVGElement> {
    type: DecorationType;
}

export const Decoration = ({ type, className, ...props }: DecorationProps) => {
    const Component = decorationMap[type];
    return <Component className={cn("pointer-events-none", className)} {...props} />;
};

    