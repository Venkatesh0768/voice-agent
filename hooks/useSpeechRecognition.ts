import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Language } from "../src/types/types";
import { 
  MicrophoneAccessDeniedMessage, 
  SpeechRecognitionNotSupportedMessage, 
  LanguageNotSupportedByBrowserSTT,
  SpeechRecognitionNetworkError,
  NoSpeechDetectedError,
  AudioCaptureError
} from '../constants';

// Minimal interfaces for Web Speech API types to resolve TypeScript errors
interface ISpeechRecognitionAlternative {
  transcript: string;
  confidence?: number;
}

interface ISpeechRecognitionResult {
  isFinal: boolean;
  readonly length: number;
  item(index: number): ISpeechRecognitionAlternative;
  [index: number]: ISpeechRecognitionAlternative; // Allows array-like access
}

interface ISpeechRecognitionResultList {
  readonly length: number;
  item(index: number): ISpeechRecognitionResult;
  [index: number]: ISpeechRecognitionResult; // Allows array-like access
}

interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: ISpeechRecognitionResultList;
  // readonly emma?: any; // For XML interpretation of results
  // readonly interpretation?: any; // For semantic interpretation
}

interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string; // Specific error codes like 'no-speech', 'not-allowed', etc.
  readonly message: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  // grammars: SpeechGrammarList; // Not used in this hook

  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null; // Changed to match standard Event type for onend
  // Other events not used in this hook: onaudiostart, onaudioend, onnomatch, onsoundstart, onsoundend, onspeechstart, onspeechend, onstart

  start(): void;
  stop(): void;
  abort(): void;
}

interface ISpeechRecognitionStatic {
  new (): ISpeechRecognition;
}


interface SpeechRecognitionHook {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  startListening: (lang: Language) => void;
  stopListening: () => void;
  error: string | null;
  isSupported: boolean;
  resetTranscript: () => void;
}

const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI: ISpeechRecognitionStatic | undefined = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setError(SpeechRecognitionNotSupportedMessage);
      return;
    }

    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let finalTranscript = '';
      let currentInterimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const resultItem = event.results.item(i); // Use item() for safety
        if (resultItem.isFinal) {
          finalTranscript += resultItem.item(0).transcript;
        } else {
          currentInterimTranscript += resultItem.item(0).transcript;
        }
      }
      setTranscript(prev => prev + finalTranscript);
      setInterimTranscript(currentInterimTranscript);
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error event:', event.error, event.message);
      let specificErrorMessage = `An unknown speech recognition error occurred: ${event.error}. ${event.message || ''}`;

      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          specificErrorMessage = MicrophoneAccessDeniedMessage;
          break;
        case 'language-not-supported':
          specificErrorMessage = LanguageNotSupportedByBrowserSTT;
          break;
        case 'network':
          specificErrorMessage = SpeechRecognitionNetworkError;
          break;
        case 'no-speech':
          specificErrorMessage = NoSpeechDetectedError;
          break;
        case 'audio-capture':
          specificErrorMessage = AudioCaptureError;
          break;
        case 'aborted':
           specificErrorMessage = "Speech recognition was aborted. Please try again.";
           break;
        // Other cases like 'bad-grammar' could be handled if needed.
      }
      setError(specificErrorMessage.trim());
      setIsListening(false);
    };

    recognition.onend = () => {
      // This event fires when the recognition service has disconnected.
      // It can happen after stop() is called, after an error, or sometimes spontaneously
      // (e.g., some browsers might terminate continuous recognition after a long period of silence or network issues).
      // We ensure isListening is false to accurately reflect the state.
      setIsListening(false);
    };
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort(); // Use abort to ensure it stops immediately and cleanly
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      }
    };
  }, []);

  const startListening = useCallback((lang: Language) => {
    if (!recognitionRef.current || !isSupported) {
      setError(isSupported ? "Recognition service not initialized." : SpeechRecognitionNotSupportedMessage);
      return;
    }
    if (isListening) return;

    setTranscript('');
    setInterimTranscript('');
    setError(null);
    recognitionRef.current.lang = lang === Language.HINDI ? 'hi-IN' : 'en-US';
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e: any) {
        // This catch block might capture errors if start() is called in an invalid state,
        // though most operational errors are handled by recognition.onerror.
        console.error("Error invoking speech recognition start():", e);
        setError(`Failed to start listening: ${e.message || "Unknown error"}`);
        setIsListening(false);
    }
  }, [isListening, isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;
    if (!isListening) return; // If already stopped (e.g. by error or onend), do nothing

    try {
      recognitionRef.current.stop();
    } catch (e: any) {
      // Catch potential errors if stop() is called in an unusual state, though less common.
      console.error("Error invoking speech recognition stop():", e);
    }
    // setIsListening(false) will be handled by the 'onend' event,
    // or if stop() itself triggers an error, 'onerror' will handle it.
    // However, for immediate feedback if stopListening is user-initiated:
    setIsListening(false); 
  }, [isListening, isSupported]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return { transcript, interimTranscript, isListening, startListening, stopListening, error, isSupported, resetTranscript };
};

export default useSpeechRecognition;
