'use client';

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type LogoProps = {
  large?: boolean;
  className?: string;
};

export function Logo({ large = false, className }: LogoProps) {
  const [imgSrc, setImgSrc] = useState('/logo.jpg');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Verify image exists on mount
    const img = new Image();
    img.onload = () => {
      setHasError(false);
    };
    img.onerror = () => {
      console.warn('Logo.jpg not found, using SVG fallback');
      setImgSrc('/logo.svg');
      setHasError(true);
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
          if (!hasError) {
            console.error('Logo image failed to load, trying SVG fallback');
            const target = e.target as HTMLImageElement;
            if (target.src !== '/logo.svg') {
              setImgSrc('/logo.svg');
              setHasError(true);
            }
          }
        }}
      />
    </div>
  );
}
