'use client';

import { cn } from "@/lib/utils";
import Image from "next/image";

type LogoProps = {
  large?: boolean;
  className?: string;
};

export function Logo({ large = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Image
        src="/logo.jpg"
        alt="Chonieur Food & Helado"
        width={large ? 300 : 150}
        height={large ? 300 : 150}
        className={cn(
          "object-contain",
          large 
            ? "w-[280px] sm:w-[320px] md:w-[380px] lg:w-[420px] h-auto max-w-full" 
            : "h-full w-auto max-h-full"
        )}
        priority={large}
        unoptimized
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
}
