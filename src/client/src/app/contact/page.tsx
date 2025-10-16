import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

const contactInfo = [
    {
        icon: MapPin,
        title: "Address",
        details: "123 Food Street, Oran, Algeria"
    },
    {
        icon: Phone,
        title: "Phone",
        details: "+213 555 123 456"
    },
    {
        icon: Mail,
        title: "Email",
        details: "contact@chouieurfood.com"
    },
    {
        icon: Clock,
        title: "Opening Hours",
        details: "Everyday: 11:00 AM - 11:00 PM"
    }
];

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <header className="mb-12 text-center">
        <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">
          Get In Touch
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          We'd love to hear from you! Here's how you can reach us.
        </p>
      </header>

      <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2">
        {contactInfo.map((info) => (
            <Card key={info.title} className="text-center shadow-lg transition-transform hover:scale-105">
                <CardHeader className="items-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <info.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="font-headline text-2xl">{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-muted-foreground">{info.details}</p>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
