import { cn } from "@/lib/utils";

type LogoProps = {
  large?: boolean;
  className?: string;
};

export function Logo({ large = false, className }: LogoProps) {
  return (
    <div className={cn("font-headline text-primary-foreground", className)}>
      <h1 className={cn(
        large ? "text-5xl md:text-7xl" : ""
      )}>
        <span className="text-primary">Chouieur</span> Food & Helado
      </h1>
    </div>
  );
}
