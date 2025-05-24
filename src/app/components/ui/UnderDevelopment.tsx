"use client";

import React from 'react';

interface UnderDevelopmentProps {
  title?: string;
  message?: string;
  variant?: 'banner' | 'card' | 'overlay' | 'badge';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const UnderDevelopment: React.FC<UnderDevelopmentProps> = ({
  title = "Fitur Dalam Pengembangan",
  message = "Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia.",
  variant = 'card',
  size = 'md',
  showIcon = true,
  className = ""
}) => {
  const baseClasses = "flex items-center justify-center text-center";
  
  const variantClasses = {
    banner: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4",
    card: "bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg",
    overlay: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
    badge: "bg-yellow-500/20 border border-yellow-500/50 rounded-full px-3 py-1 text-sm"
  };
  
  const sizeClasses = {
    sm: variant === 'badge' ? 'text-xs' : 'text-sm',
    md: variant === 'badge' ? 'text-sm' : 'text-base',
    lg: variant === 'badge' ? 'text-base' : 'text-lg'
  };
  
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const ConstructionIcon = () => (
    <svg 
      className={`${iconSizes[size]} text-yellow-400 ${variant === 'badge' ? 'mr-1' : 'mb-3'}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
      />
    </svg>
  );

  if (variant === 'badge') {
    return (
      <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
        {showIcon && <ConstructionIcon />}
        <span className="text-yellow-300 font-medium">Dalam Pengembangan</span>
      </span>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className={`${variantClasses[variant]} ${className}`}>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-4">
          <div className="flex flex-col items-center">
            {showIcon && <ConstructionIcon />}
            <h3 className={`font-bold text-white ${sizeClasses[size]} mb-2`}>{title}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{message}</p>
            <div className="mt-4 flex space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="flex flex-col items-center">
        {showIcon && <ConstructionIcon />}
        <h3 className={`font-bold text-white ${sizeClasses[size]} mb-2`}>{title}</h3>
        <p className="text-white/70 text-sm leading-relaxed max-w-md">{message}</p>
        {variant === 'card' && (
          <div className="mt-4 flex space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnderDevelopment;