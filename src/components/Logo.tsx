'use client';

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type LogoProps = {
  large?: boolean;
  className?: string;
};

export function Logo({ large = false, className }: LogoProps) {
  // Try local file first, fallback to ImgBB URL, then SVG
  const [imgSrc, setImgSrc] = useState('/logo.jpg');
  const [hasError, setHasError] = useState(false);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  useEffect(() => {
    // Verify image exists on mount
    const img = new Image();
    img.onload = () => {
      setHasError(false);
    };
    img.onerror = () => {
      console.warn('Local logo.jpg not found, trying ImgBB URL');
      // Try ImgBB URL as fallback
      setImgSrc('https://i.ibb.co/ccSNgY1G/IMG-8377.jpg');
      setFallbackUsed(true);
    };
    img.src = '/logo.jpg';
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
          if (!fallbackUsed && target.src.includes('/logo.jpg')) {
            // First error: try ImgBB URL
            console.warn('Local logo failed, trying ImgBB URL');
            setImgSrc('https://i.ibb.co/ccSNgY1G/IMG-8377.jpg');
            setFallbackUsed(true);
          } else if (fallbackUsed && !target.src.includes('logo.svg')) {
            // Second error: try SVG fallback
            console.warn('ImgBB URL failed, using SVG fallback');
            setImgSrc('/logo.svg');
            setHasError(true);
          }
        }}
      />
    </div>
  );
}
