'use client';

import { cn } from "@/lib/utils";

type LogoProps = {
  large?: boolean;
  className?: string;
};

export function Logo({ large = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img
        src="/logo.jpg"
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
          console.error('Logo failed to load, trying fallback');
          const target = e.target as HTMLImageElement;
          // Try SVG fallback
          if (target.src !== '/logo.svg') {
            target.src = '/logo.svg';
          }
        }}
      />
    </div>
  );
}
