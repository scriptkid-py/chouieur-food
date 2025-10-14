import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === "hero");

  return (
    <div className="relative flex h-[calc(100vh-10rem)] items-center justify-center text-center text-white">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          data-ai-hint={heroImage.imageHint}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 flex flex-col items-center gap-6 px-4">
        <div className="mb-4">
          <Logo large />
        </div>
        <p className="max-w-2xl text-lg text-primary-foreground/90 md:text-xl">
          Fresh, Fast, and Flavorful. Your next favorite meal is just a click away.
        </p>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg tracking-wider transition-transform duration-300 hover:scale-105">
          <Link href="/menu">Order Now</Link>
        </Button>
      </div>
    </div>
  );
}
