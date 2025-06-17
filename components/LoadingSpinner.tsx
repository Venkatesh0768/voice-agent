import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class e.g., 'text-indigo-600'
  className?: string; // Allow additional classes
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-indigo-600', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-solid border-t-transparent ${color}`}
        style={{ borderTopColor: 'transparent' }}
        role="status"
        aria-live="polite"
        aria-label="Loading"
      ></div>
    </div>
  );
};

export default LoadingSpinner;