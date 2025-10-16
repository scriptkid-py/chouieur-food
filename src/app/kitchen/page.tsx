'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed } from "lucide-react";


export default function KitchenViewPage() {
    
    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-headline font-bold">Kitchen View</h1>
                <p className="text-muted-foreground">Live list of confirmed orders to be prepared.</p>
            </header>

            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-bold tracking-tight">Live Order Feed is Disconnected</h2>
                <p className="text-muted-foreground">
                    This view is not currently connected to live Firestore data.
                </p>
            </div>
        </div>
    );
}
