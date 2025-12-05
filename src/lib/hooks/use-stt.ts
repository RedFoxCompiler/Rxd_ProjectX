
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

// A type guard to check if the browser supports SpeechRecognition
const isSpeechRecognitionSupported = (): boolean => 
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

export function useSpeechToText(onFinalResult: (text: string) => void) {
    const recognitionRef = useRef<any>(null);
    const [isListening, setIsListening] = useState(false);
    const finalTranscriptRef = useRef('');
    
    // Memoize the onFinalResult callback to prevent re-creating the effect unnecessarily
    const stableOnFinalResult = useCallback(onFinalResult, [onFinalResult]);

    useEffect(() => {
        if (!isSpeechRecognitionSupported()) {
            console.warn("SpeechRecognition not supported in this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "pt-BR";

        rec.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                finalTranscriptRef.current += finalTranscript;
            }
        };

        rec.onend = () => {
            // Only call the final result callback if we were actually listening
            if (isListening) {
                stableOnFinalResult(finalTranscriptRef.current.trim());
            }
            setIsListening(false);
        };

        rec.onerror = (event: any) => {
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                console.error("SpeechRecognition error:", event.error);
            }
            setIsListening(false);
        };
        
        recognitionRef.current = rec;
        
        return () => {
             if (recognitionRef.current) {
               recognitionRef.current.abort();
            }
        };

    }, [stableOnFinalResult, isListening]);

    const start = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                finalTranscriptRef.current = ''; 
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                if ((e as DOMException).name !== 'InvalidStateError') {
                    console.error("STT start error:", e);
                }
                setIsListening(false);
            }
        }
    }, [isListening]);

    const stop = useCallback((abort = false) => {
        if (recognitionRef.current && isListening) {
             if (abort) {
                recognitionRef.current.abort();
             } else {
                recognitionRef.current.stop();
             }
        }
    }, [isListening]);

    return { start, stop, isListening };
}
