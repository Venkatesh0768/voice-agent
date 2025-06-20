import React from 'react';
import { ChatMessage, Language } from '../src/types/types';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';
  const isSystem = message.sender === 'system';

  const langLabel = message.language === Language.HINDI ? ' (हिन्दी)' : message.language === Language.ENGLISH ? ' (English)' : '';

  // Base classes for all bubbles
  let bubbleBaseClasses = 'break-words transition-all duration-200 ease-in-out px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg';
  let wrapperClasses = 'w-full flex my-1.5 sm:my-2'; // Responsive vertical margin
  let timestampClasses = 'text-xs mt-1 opacity-80';

  if (isUser) {
    bubbleBaseClasses += ' bg-indigo-600 text-white ml-auto rounded-br-none'; // User bubbles on right, no bottom-right radius
    wrapperClasses += ' justify-end';
    timestampClasses += ' text-indigo-100';
  } else if (isAI) {
    bubbleBaseClasses += ' bg-slate-200 text-slate-800 mr-auto rounded-bl-none'; // AI bubbles on left, no bottom-left radius
    wrapperClasses += ' justify-start';
    timestampClasses += ' text-slate-600';
  } else { // System message
    bubbleBaseClasses = 'bg-blue-100 text-blue-800 self-center italic text-sm rounded-lg p-2.5 max-w-[90%] md:max-w-[70%] text-center border border-blue-200 shadow-sm';
    wrapperClasses = 'w-full flex justify-center my-4'; // More prominent margin for system messages
    timestampClasses = 'text-xs mt-1.5 text-blue-600 opacity-80'; // System timestamp
  }

  return (
    <div className={wrapperClasses}>
      <div className={bubbleBaseClasses}>
        {isAI && (
          <div className="absolute -left-3 -bottom-1 transform translate-x-[-50%] text-xl text-slate-400 opacity-80">
            <i className="fas fa-robot"></i>
          </div>
        )}
        <p className="text-sm mb-1">{message.text}</p>
        <p className={timestampClasses}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isUser && langLabel}
        </p>
        {/* Removed tails for a cleaner, modern look, relying on border-radius */}
      </div>
    </div>
  );
};

export default ChatBubble;