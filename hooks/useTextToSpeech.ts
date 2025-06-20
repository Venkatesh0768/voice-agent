import React, { useState, useEffect, useCallback } from 'react';
import { Language } from "../src/types/types";
import { HINDI_VOICE_NAME_KEYWORD, ENGLISH_VOICE_NAME_KEYWORD, LanguageNotSupportedByBrowserTTS, SpeechSynthesisNotSupportedMessage } from '../constants';

interface TextToSpeechHook {
  speak: (text: string, lang: Language, rate?: number) => void;
  isSpeaking: boolean;
  isSupported: boolean;
  error: string | null;
  cancel: () => void;
}

const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      setError(SpeechSynthesisNotSupportedMessage);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        console.log('Available TTS voices:', availableVoices); // Log available voices
      }
    };

    loadVoices();
    // Voices might load asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (window.speechSynthesis) { // Ensure speechSynthesis exists before calling cancel
        window.speechSynthesis.cancel(); // Cancel any ongoing speech on unmount
      }
    };
  }, []);

  const speak = useCallback((text: string, lang: Language, rate: number = 1) => {
    if (!isSupported || !text.trim()) return;

    setError(null); // Clear previous errors before attempting to speak
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === Language.HINDI ? 'hi-IN' : 'en-US';
    utterance.rate = rate;

    const targetVoiceKeyword = lang === Language.HINDI ? HINDI_VOICE_NAME_KEYWORD : ENGLISH_VOICE_NAME_KEYWORD;
    
    let selectedVoice = null;
    if (voices.length > 0) {
        selectedVoice = voices.find(voice => 
            voice.lang.toLowerCase().startsWith(utterance.lang.toLowerCase().split('-')[0]) && 
            voice.name.toLowerCase().includes(targetVoiceKeyword)
        ) || voices.find(voice => voice.lang.toLowerCase().startsWith(utterance.lang.toLowerCase().split('-')[0]));
    }


    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else if (voices.length > 0) {
      const hasLangSupport = voices.some(v => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
      if(!hasLangSupport){
        console.warn(`No voice found for language ${lang} (utterance.lang: ${utterance.lang}). TTS may not work or use default.`);
        setError(LanguageNotSupportedByBrowserTTS); 
      } else {
        console.warn(`Specific voice with keyword '${targetVoiceKeyword}' for ${utterance.lang} not found. Using browser default for the language.`);
      }
    } else {
        console.warn("TTS voices array is empty. Speech synthesis might not be available or fully initialized.");
        if(isSupported) setError(LanguageNotSupportedByBrowserTTS);
    }


    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.error('Speech synthesis error raw event:', event);
      // If the error is 'interrupted', it's often due to an explicit cancel() call
      // or a new speak() call replacing the current one. We log it but don't show a user-facing error.
      if (event.error !== 'interrupted') {
        setError(`Speech synthesis error: ${event.error}`);
      } else {
        console.log("Speech synthesis was interrupted (likely intentionally by app action).");
      }
      setIsSpeaking(false); // Ensure speaking state is reset
    };

    window.speechSynthesis.cancel(); // Cancel previous speech before starting a new one
    window.speechSynthesis.speak(utterance);
  }, [isSupported, voices]);

  const cancel = useCallback(() => {
    if(isSupported && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false); 
    }
  }, [isSupported]);

  return { speak, isSpeaking, isSupported, error, cancel };
};

export default useTextToSpeech;
