import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get API URL (works at runtime)
export function getApiUrl(): string {
  // Client-side: check if we're on Render
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('onrender.com')) {
      // Use env var if available, otherwise construct from hostname
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      if (envUrl && !envUrl.includes('localhost')) {
        return envUrl;
      }
      // Auto-detect backend URL from frontend hostname
      const hostname = window.location.hostname;
      if (hostname.includes('fanhouse-frontend')) {
        return `https://${hostname.replace('fanhouse-frontend', 'fanhouse-backend')}`;
      }
      // Fallback
      return 'https://fanhouse-backend.onrender.com';
    }
  }
  // Development: use env var or localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}
