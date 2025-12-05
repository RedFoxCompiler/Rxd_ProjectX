'use client';

import { useCallback } from 'react';

export function useTextToSpeech(onStart?: () => void, onEnd?: () => void) {

    const speak = useCallback((text: string, options?: { pitch?: number; rate?: number; }) => {
        if (!("speechSynthesis" in window)) {
            console.warn("SpeechSynthesis not supported.");
            return null;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        
        // Find a suitable female voice for Brazilian Portuguese
        const preferredVoice = voices.find(v => v.lang === 'pt-BR' && /female|mulher/i.test(v.name)) || voices.find(v => v.lang === 'pt-BR');
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.pitch = options?.pitch ?? 1.1;
        utterance.rate = options?.rate ?? 1.0;

        utterance.onstart = () => onStart?.();
        utterance.onend = () => onEnd?.();
        utterance.onerror = (e) => {
            console.error("TTS error:", e);
            onEnd?.(); // Ensure state is reset on error
        };

        window.speechSynthesis.speak(utterance);
        return utterance;

    }, [onStart, onEnd]);

    const cancel = useCallback(() => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    }, []);

    return { speak, cancel };
}
