'use client';

import { useEffect, useState } from 'react';

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
}

export function Loader({ fullScreen = true, message = 'Loading...' }: LoaderProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
        <div className="text-center">
          {/* Animated Logo */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse opacity-75"></div>
            </div>
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="text-6xl font-bold text-white animate-bounce">F</div>
            </div>
            {/* Rotating rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
          </div>

          {/* Loading text */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-2">FanHouse</h2>
            <p className="text-purple-200 text-lg">
              {message}
              <span className="inline-block w-4">{dots}</span>
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-8 w-64 mx-auto">
            <div className="h-1 bg-purple-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Inline loader for smaller loading states
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
        <p className="text-gray-600 text-sm">{message}{dots}</p>
      </div>
    </div>
  );
}

