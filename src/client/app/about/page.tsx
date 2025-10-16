import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find(p => p.id === "hero");

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">
            About Chouieur Food & Helado
          </h1>
          <p className="text-lg leading-relaxed text-foreground/80">
            Welcome to Chouieur Food & Helado, where flavor meets passion. Founded with a love for great food and community, our mission is to serve delicious, high-quality fast food that brings people together. From our signature sandwiches to our mouth-watering pizzas, every dish is crafted with care using the freshest ingredients.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            We believe in creating memorable experiences, whether you're dining in, taking out, or ordering for delivery. Our team is dedicated to providing excellent service and a welcoming atmosphere for everyone. Thank you for being a part of our story.
          </p>
        </div>
        <div className="flex items-center justify-center">
            {aboutImage && (
                <Card className="overflow-hidden rounded-xl shadow-2xl">
                    <div className="relative h-96 w-full">
                        <Image
                            src={aboutImage.imageUrl}
                            alt="Inside of Chouieur Food & Helado"
                            data-ai-hint="restaurant interior"
                            fill
                            className="object-cover"
                        />
                    </div>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
