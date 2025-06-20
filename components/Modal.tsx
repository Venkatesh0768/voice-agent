import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-3 sm:p-4 border-b">
          {title && <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h3>}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <i className="fas fa-times text-lg sm:text-xl"></i>
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="p-3 sm:p-4 border-t flex justify-end space-x-2 sm:space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
