
'use client';

import { useRef, useCallback, useState } from 'react';

export function useMicrophone() {
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const init = useCallback(async () => {
        if (isInitialized) return true;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioCtx();
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.5;
            source.connect(analyser);

            analyserRef.current = analyser;
            setIsInitialized(true);
            return true;
        } catch (error) {
            console.error("Microphone initialization failed:", error);
            setIsInitialized(false);
            return false;
        }
    }, [isInitialized]);

    const stop = useCallback(() => {
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        mediaStreamRef.current = null;
        audioContextRef.current = null;
        analyserRef.current = null;
        sourceNodeRef.current = null;
        setIsInitialized(false);
    }, []);

    const connectAnalyser = useCallback(() => {
        if (analyserRef.current && sourceNodeRef.current) {
            sourceNodeRef.current.connect(analyserRef.current);
        }
    }, []);

    const disconnectAnalyser = useCallback(() => {
        if(sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
        }
    }, []);


    const getAnalyser = useCallback(() => analyserRef.current, []);
    const getAudioContext = useCallback(() => audioContextRef.current!, []);


    return { init, stop, getAnalyser, getAudioContext, connectAnalyser, disconnectAnalyser, mediaStream: mediaStreamRef.current, isInitialized };
}
