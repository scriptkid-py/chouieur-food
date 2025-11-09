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
        width={large ? 400 : 200}
        height={large ? 400 : 200}
        className={cn(
          "object-contain",
          large ? "w-[400px] md:w-[500px] h-auto" : "h-full w-auto max-h-full"
        )}
        priority
        unoptimized
      />
    </div>
  );
}
