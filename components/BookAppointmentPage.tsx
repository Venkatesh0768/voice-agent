import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Language, PatientData, ChatMessage, AppointmentTicket, AppointmentStatus } from '../src/types/types';
import { Chat } from '@google/genai';
import { AuthContext } from '../contexts/AuthContext';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useTextToSpeech from '../hooks/useTextToSpeech';
import ChatBubble from './ChatBubble';
import AppointmentTicketCard from './AppointmentTicketCard';
import Modal from './Modal';
import { startChatSession, sendMessageToChat, extractPatientDataFromChat } from '../services/geminiService';
import { createAppointment } from '../src/services/firebaseService';
import {
  YES_NO_CONFIRMATION_PROMPT_ENGLISH,
  YES_NO_CONFIRMATION_PROMPT_HINDI,
  CORRECTION_REQUEST_PROMPT_ENGLISH,
  CORRECTION_REQUEST_PROMPT_HINDI,
  GeminiErrorMesssage,
  GenericErrorMessage,
  SpeechRecognitionNotSupportedMessage
} from '../constants';

// 1. Replaced currentView and confirmationStage with a single, more descriptive state enum
enum FlowState {
  LANGUAGE_SELECTION,
  CONVERSATION_IN_PROGRESS,
  AWAITING_PHONE_CONFIRMATION,
  AWAITING_DETAILS_CONFIRMATION,
  AWAITING_APPOINTMENT_TIME,
  TICKET_DISPLAY,
}

const BookAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  // --- REFINED STATE MANAGEMENT ---
  const [flowState, setFlowState] = useState<FlowState>(FlowState.LANGUAGE_SELECTION);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [patientData, setPatientData] = useState<PatientData>({ name: null, age: null, gender: null, symptoms: null, phone: null });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [appointmentTicket, setAppointmentTicket] = useState<AppointmentTicket | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [textInputValue, setTextInputValue] = useState('');
  const [speechRate, setSpeechRate] = useState(1);
  const [lastAIMessage, setLastAIMessage] = useState<string | null>(null);

  const geminiChatRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    transcript,
    isListening,
    startListening: sttStartListening,
    stopListening: sttStopListening,
    error: sttError,
    isSupported: sttIsSupported,
    resetTranscript: sttResetTranscript,
  } = useSpeechRecognition();

  const {
    speak: ttsSpeak,
    isSpeaking: ttsIsSpeaking,
    isSupported: ttsIsSupported,
    error: ttsError,
    cancel: ttsCancel,
  } = useTextToSpeech();

  // --- UTILITY AND HELPER FUNCTIONS ---

  const handleDisplayError = useCallback((message: string) => {
    setErrorMessage(message);
    setShowErrorModal(true);
    setIsLoadingAI(false);
  }, []);
  
  const addMessageToChat = useCallback((sender: 'user' | 'ai' | 'system', text: string, langOverride?: Language) => {
    const language = langOverride ?? selectedLanguage ?? Language.ENGLISH;
    setChatMessages(prev => [...prev, { id: Date.now().toString(), sender, text, timestamp: new Date(), language }]);
    if (sender === 'ai' && ttsIsSupported) {
      ttsSpeak(text, language, speechRate);
      setLastAIMessage(text);
    }
  }, [selectedLanguage, ttsIsSupported, ttsSpeak, speechRate]);

  const resetConversation = useCallback(() => {
    setFlowState(FlowState.LANGUAGE_SELECTION);
    setSelectedLanguage(null);
    setPatientData({ name: null, age: null, gender: null, symptoms: null, phone: null });
    setChatMessages([]);
    setIsLoadingAI(false);
    setAppointmentTicket(null);
    setTextInputValue('');
    sttResetTranscript();
    ttsCancel();
    geminiChatRef.current = null;
  }, [sttResetTranscript, ttsCancel]);

  useEffect(() => {
    if (sttError) handleDisplayError(sttError);
  }, [sttError, handleDisplayError]);

  useEffect(() => {
    if (ttsError) handleDisplayError(GenericErrorMessage);
  }, [ttsError, handleDisplayError]);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // --- CORE LOGIC FUNCTIONS ---

  const initializeAndStartChat = useCallback(async (lang: Language) => {
    resetConversation();
    setSelectedLanguage(lang);
    setFlowState(FlowState.CONVERSATION_IN_PROGRESS);
    setIsLoadingAI(true);
    
    try {
      const chat = await startChatSession(lang);
      geminiChatRef.current = chat;
      const firstAiResponse = await sendMessageToChat(chat, "Start the conversation by greeting me and asking for my name.");
      addMessageToChat('ai', firstAiResponse, lang);
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      handleDisplayError(GeminiErrorMesssage);
      resetConversation();
    } finally {
      setIsLoadingAI(false);
    }
  }, [addMessageToChat, handleDisplayError, resetConversation]);

  // --- STATE-BASED LOGIC HANDLERS ---
  
  const processGeneralConversation = useCallback(async (messageText: string) => {
    const aiResponseText = await sendMessageToChat(geminiChatRef.current!, messageText);
    addMessageToChat('ai', aiResponseText);

    if (aiResponseText.trim().toUpperCase().includes("ALL_INFO_COLLECTED")) {
      setIsLoadingAI(true);
      const historyForExtraction = [...chatMessages, {id: 'temp', sender: 'user', text: messageText, timestamp: new Date()}]
        .filter(msg => msg.sender === 'user' || msg.sender === 'ai')
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n');
      
      const extractedData = await extractPatientDataFromChat(historyForExtraction);
      const extractedPhone = extractedData?.phone ? String(extractedData.phone).replace(/\D/g, '') : null;

      if (extractedData?.name && extractedData?.age && extractedData?.gender && extractedData?.symptoms && extractedPhone && extractedPhone.length === 10) {
        setPatientData({ ...extractedData, phone: extractedPhone });
        const prompt = selectedLanguage === Language.HINDI ? `आपका फ़ोन नंबर ${extractedPhone} है, क्या यह सही है? कृपया हाँ या नहीं में उत्तर दें।` : `Your phone number is ${extractedPhone}, is this correct? Please say Yes or No.`;
        addMessageToChat('ai', prompt);
        setFlowState(FlowState.AWAITING_PHONE_CONFIRMATION);
      } else {
        const rePromptMessage = "It seems I'm missing some information or it wasn't clear. Could you please provide your full name, age, gender, symptoms, and 10-digit phone number again?";
        addMessageToChat('ai', rePromptMessage);
      }
    }
  }, [chatMessages, selectedLanguage, addMessageToChat]);

  const processPhoneConfirmation = useCallback(async (messageText: string) => {
    const lowerText = messageText.toLowerCase();
    const isYes = (selectedLanguage === Language.HINDI ? ['हाँ', 'हां', 'जी', 'सही'] : ['yes', 'yeah', 'correct']).some(kw => lowerText.includes(kw));
    const isNo = (selectedLanguage === Language.HINDI ? ['नहीं', 'नही', 'गलत'] : ['no', 'nope', 'incorrect']).some(kw => lowerText.includes(kw));

    if (isYes && !isNo) {
      const summary = `Name: ${patientData.name}, Age: ${patientData.age}, Gender: ${patientData.gender}, Phone: ${patientData.phone}, Symptoms: ${patientData.symptoms}`;
      const prompt = selectedLanguage === Language.HINDI ? YES_NO_CONFIRMATION_PROMPT_HINDI(summary) : YES_NO_CONFIRMATION_PROMPT_ENGLISH(summary);
      addMessageToChat('ai', prompt);
      setFlowState(FlowState.AWAITING_DETAILS_CONFIRMATION);
    } else if (isNo) {
      setPatientData(prev => ({ ...prev, phone: null }));
      const prompt = selectedLanguage === Language.HINDI ? "ठीक है, कृपया अपना 10 अंकों का फ़ोन नंबर फिर से प्रदान करें।" : "Okay, please provide your 10-digit phone number again.";
      addMessageToChat('ai', prompt);
      setFlowState(FlowState.CONVERSATION_IN_PROGRESS);
    } else {
      addMessageToChat('ai', selectedLanguage === Language.HINDI ? "कृपया हाँ या नहीं में उत्तर दें।" : "Please answer with Yes or No.");
    }
  }, [selectedLanguage, patientData, addMessageToChat]);

  const processDetailsConfirmation = useCallback(async (messageText: string) => {
    const lowerText = messageText.toLowerCase();
    const isYes = (selectedLanguage === Language.HINDI ? ['हाँ', 'हां', 'जी', 'सही'] : ['yes', 'yeah', 'correct']).some(kw => lowerText.includes(kw));
    const isNo = (selectedLanguage === Language.HINDI ? ['नहीं', 'नही', 'गलत'] : ['no', 'nope', 'incorrect', 'change']).some(kw => lowerText.includes(kw));

    if (isYes && !isNo) {
      const prompt = selectedLanguage === Language.HINDI ? "बहुत बढ़िया! कृपया अपने अपॉइंटमेंट के लिए सबसे अच्छा समय बताएं।" : "Excellent! Now, please tell me the best time for your appointment.";
      addMessageToChat('ai', prompt);
      setFlowState(FlowState.AWAITING_APPOINTMENT_TIME);
    } else if (isNo) {
      setPatientData({ name: null, age: null, gender: null, symptoms: null, phone: null });
      const prompt = selectedLanguage === Language.HINDI ? CORRECTION_REQUEST_PROMPT_HINDI : CORRECTION_REQUEST_PROMPT_ENGLISH;
      addMessageToChat('ai', prompt);
      setFlowState(FlowState.CONVERSATION_IN_PROGRESS);
    } else {
      addMessageToChat('ai', selectedLanguage === Language.HINDI ? "कृपया हाँ या नहीं में उत्तर दें।" : "Please answer with Yes or No.");
    }
  }, [selectedLanguage, addMessageToChat]);

  const bookAppointment = useCallback(async (appointmentTimeText: string) => {
    if (!patientData || !auth?.currentUser?.id || !selectedLanguage) {
      handleDisplayError(GenericErrorMessage);
      resetConversation();
      return;
    }
    const newTicket: Omit<AppointmentTicket, 'id'> = {
      patientData,
      appointmentTime: appointmentTimeText,
      language: selectedLanguage,
      userId: auth.currentUser.id,
      status: AppointmentStatus.PENDING,
      bookedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    try {
      const savedTicket = await createAppointment(newTicket);
      setAppointmentTicket(savedTicket);
      addMessageToChat('system', `Your appointment for ${appointmentTimeText} has been submitted.`);
      setFlowState(FlowState.TICKET_DISPLAY);
    } catch (error) {
      console.error("Error booking appointment:", error);
      handleDisplayError("Failed to book appointment. Please try again.");
    }
  }, [patientData, selectedLanguage, auth?.currentUser?.id, addMessageToChat, handleDisplayError, resetConversation]);


  // 2. UNIFIED message handler routes logic based on the flowState
  const handleUserMessageSubmit = useCallback(async (messageText: string) => {
    if (!messageText.trim() || !geminiChatRef.current || !selectedLanguage) return;

    addMessageToChat('user', messageText);
    setIsLoadingAI(true);
    sttResetTranscript();

    try {
      switch (flowState) {
        case FlowState.CONVERSATION_IN_PROGRESS:
          await processGeneralConversation(messageText);
          break;
        case FlowState.AWAITING_PHONE_CONFIRMATION:
          await processPhoneConfirmation(messageText);
          break;
        case FlowState.AWAITING_DETAILS_CONFIRMATION:
          await processDetailsConfirmation(messageText);
          break;
        case FlowState.AWAITING_APPOINTMENT_TIME:
          await bookAppointment(messageText);
          break;
      }
    } catch (error) {
      console.error("Error processing user message:", error);
      addMessageToChat('ai', GeminiErrorMesssage);
    } finally {
      setIsLoadingAI(false);
      setTextInputValue('');
    }
  }, [flowState, selectedLanguage, addMessageToChat, sttResetTranscript, processGeneralConversation, processPhoneConfirmation, processDetailsConfirmation, bookAppointment]);

  // --- useEffect hooks to react to changes ---

  useEffect(() => {
    if (transcript && !isListening && flowState !== FlowState.LANGUAGE_SELECTION && flowState !== FlowState.TICKET_DISPLAY) {
        handleUserMessageSubmit(transcript);
    }
  }, [transcript, isListening, flowState, handleUserMessageSubmit]);

  const handleMicrophoneToggle = () => {
    if (!sttIsSupported || !selectedLanguage) {
      handleDisplayError(sttIsSupported ? "Language not selected." : SpeechRecognitionNotSupportedMessage);
      return;
    }
    if (ttsIsSpeaking) ttsCancel();
    if (isListening) {
      sttStopListening();
    } else {
      sttResetTranscript();
      sttStartListening(selectedLanguage);
    }
  };

  const handleTextInputFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (textInputValue.trim()) {
      handleUserMessageSubmit(textInputValue);
    }
  };
  
  const resetAndNavigateToDashboard = () => {
    resetConversation();
    navigate(auth?.isAdmin() ? '/admin/dashboard' : '/dashboard');
  };

  // --- RENDER LOGIC ---

  const AiTypingIndicator = () => (
    <div className="flex items-center justify-start mb-4 ml-2 animate-pulse">
      <div className="flex items-center space-x-2">
        <span className="inline-block w-2.5 h-2.5 bg-gray-400 rounded-full"></span>
        <span className="inline-block w-2.5 h-2.5 bg-gray-400 rounded-full animation-delay-200"></span>
        <span className="inline-block w-2.5 h-2.5 bg-gray-400 rounded-full animation-delay-400"></span>
      </div>
      <p className="ml-3 text-sm text-gray-500 italic">AI is thinking...</p>
    </div>
  );

  const renderContent = () => {
    // 3. Render logic is now simpler, driven by the single flowState
    switch (flowState) {
      case FlowState.LANGUAGE_SELECTION:
        return (
          <div className="flex flex-col items-center justify-center space-y-6 flex-grow p-4">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Book Your Appointment</h1>
            <p className="text-lg text-slate-600 text-center max-w-lg">Please select your preferred language to start.</p>
            <div className="flex space-x-4">
              <button onClick={() => initializeAndStartChat(Language.ENGLISH)} className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-indigo-700 transition-colors transform hover:scale-105">English</button>
              <button onClick={() => initializeAndStartChat(Language.HINDI)} className="bg-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-green-700 transition-colors transform hover:scale-105">हिन्दी</button>
            </div>
          </div>
        );

      case FlowState.CONVERSATION_IN_PROGRESS:
      case FlowState.AWAITING_PHONE_CONFIRMATION:
      case FlowState.AWAITING_DETAILS_CONFIRMATION:
      case FlowState.AWAITING_APPOINTMENT_TIME:
        return (
          <div className="flex flex-col flex-grow bg-white/90 rounded-2xl shadow-xl p-2 sm:p-6 mt-4 mb-2 overflow-y-auto min-h-[300px] max-h-[70vh] w-full">
            <div ref={chatContainerRef} className="flex flex-col space-y-2 w-full overflow-y-auto flex-grow min-h-[200px]">
              {chatMessages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              {isLoadingAI && <AiTypingIndicator />}
            </div>
            <form onSubmit={handleTextInputFormSubmit} className="w-full max-w-full flex items-center bg-gray-100 border-t border-gray-200 flex-shrink-0 rounded-b-2xl overflow-hidden">
              <input type="text" value={textInputValue} onChange={(e) => setTextInputValue(e.target.value)} placeholder="Type your message..." className="flex-grow min-w-0 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base bg-white" disabled={isLoadingAI || ttsIsSpeaking} />
              <button type="button" onClick={handleMicrophoneToggle} className={`ml-2 p-3.5 rounded-full shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 shrink-0 ${isListening ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-sky-500 text-white hover:bg-sky-600'}`} disabled={isLoadingAI || ttsIsSpeaking || !sttIsSupported} title={isListening ? "Stop listening" : "Start listening"}>
                <i className={`fas ${isListening ? 'fa-microphone-slash' : 'fa-microphone'} text-lg`}></i>
              </button>
              <button type="submit" className="ml-2 bg-indigo-600 text-white p-3.5 rounded-full shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors shrink-0" disabled={isLoadingAI || ttsIsSpeaking || textInputValue.trim() === ''} title="Send message">
                <i className="fas fa-paper-plane text-lg"></i>
              </button>
            </form>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center space-x-2">
                <button type="button" onClick={() => setSpeechRate(Math.max(0.5, speechRate - 0.1))} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">-</button>
                <span className="font-medium">{speechRate.toFixed(1)}x</span>
                <button type="button" onClick={() => setSpeechRate(Math.min(2, speechRate + 0.1))} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">+</button>
                <span className="ml-2 text-xs text-gray-500">AI Speech Speed</span>
              </div>
              <button type="button" onClick={() => lastAIMessage && ttsSpeak(lastAIMessage, selectedLanguage ?? Language.ENGLISH, speechRate)} className="ml-4 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center" disabled={!lastAIMessage} title="Repeat last AI message">
                <i className="fas fa-redo mr-1"></i> Repeat
              </button>
            </div>
          </div>
        );

      case FlowState.TICKET_DISPLAY:
        return (
          <div className="flex flex-col items-center justify-center flex-grow p-4 bg-gray-100">
            <h2 className="text-3xl font-bold text-green-700 mb-6">Appointment Submitted!</h2>
            <p className="text-slate-600 text-center mb-6 max-w-md">Your request has been received. You will be notified once it is confirmed by the administrator.</p>
            {appointmentTicket && <AppointmentTicketCard ticket={appointmentTicket} />}
            <button onClick={resetAndNavigateToDashboard} className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-full text-lg font-semibold shadow-lg hover:bg-indigo-700 transition-colors transform hover:scale-105">Go to Dashboard</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 flex flex-col items-center px-2 sm:px-6 md:px-12 py-4 sm:py-8">
      <div className="flex flex-col flex-grow w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </div>
      <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="Error">
        <p className="text-red-600 text-center text-lg">{errorMessage}</p>
        <button onClick={() => setShowErrorModal(false)} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Close</button>
      </Modal>
    </div>
  );
};

export default BookAppointmentPage;