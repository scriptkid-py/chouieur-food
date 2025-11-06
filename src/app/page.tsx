import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === "hero");

  return (
    <div className="relative flex min-h-[60vh] sm:min-h-[70vh] md:h-[calc(100vh-10rem)] items-center justify-center text-center text-white">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          data-ai-hint={heroImage.imageHint}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="mb-2 sm:mb-4">
          <Logo large />
        </div>
        <p className="max-w-2xl text-base sm:text-lg md:text-xl px-2" style={{ color: '#d89a32' }}>
          Fresh, Fast, and Flavorful. Your next favorite meal is just a click away.
        </p>
        <Button 
          asChild 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-base sm:text-lg tracking-wider transition-transform duration-300 hover:scale-105 active:scale-95 touch-manipulation px-6 sm:px-8 py-6 sm:py-7"
        >
          <Link href="/menu">Order Now</Link>
        </Button>
      </div>
    </div>
  );
}
