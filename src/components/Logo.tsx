'use client';

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type LogoProps = {
  large?: boolean;
  className?: string;
};

export function Logo({ large = false, className }: LogoProps) {
  // Use PostImg URL as primary, with local PNG and SVG fallbacks
  const [imgSrc, setImgSrc] = useState('https://i.postimg.cc/Njt0HjJG/IMG-8377.png');
  const [hasError, setHasError] = useState(false);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  useEffect(() => {
    // Verify image exists on mount
    const img = new Image();
    img.onload = () => {
      setHasError(false);
    };
    img.onerror = () => {
      console.warn('PostImg URL not found, trying local PNG');
      // Try local PNG as fallback
      setImgSrc('/logo.png');
      setFallbackUsed(true);
    };
    img.src = 'https://i.postimg.cc/Njt0HjJG/IMG-8377.png';
  }, []);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img
        src={imgSrc}
        alt="Chonieur Food & Helado"
        className={cn(
          "object-contain",
          large 
            ? "w-[280px] sm:w-[320px] md:w-[380px] lg:w-[420px] h-auto max-w-full" 
            : "h-full w-auto max-h-full"
        )}
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (!fallbackUsed && target.src.includes('postimg.cc')) {
            // First error: try local PNG
            console.warn('PostImg URL failed, trying local PNG');
            setImgSrc('/logo.png');
            setFallbackUsed(true);
          } else if (fallbackUsed && !target.src.includes('logo.svg')) {
            // Second error: try SVG fallback
            console.warn('Local PNG failed, using SVG fallback');
            setImgSrc('/logo.svg');
            setHasError(true);
          }
        }}
      />
    </div>
  );
}
