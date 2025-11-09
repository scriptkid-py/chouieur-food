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
        src="/logo.svg"
        alt="Chonieur Food & Helado"
        width={large ? 300 : 160}
        height={large ? 360 : 192}
        className={cn(
          "object-contain",
          large ? "w-[300px] md:w-[400px] h-auto" : "h-full w-auto max-h-full"
        )}
        priority
        unoptimized
      />
    </div>
  );
}
