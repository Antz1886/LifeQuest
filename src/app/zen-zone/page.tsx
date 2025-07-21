
"use client";

import Image from "next/image";
import { UserProvider } from "@/context/user-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Wind, Ear, PlayCircle } from "lucide-react";

const zenActivities = [
    {
        title: "Guided Meditation",
        description: "Follow a 10-minute guided session to calm your mind and reduce stress.",
        icon: <BrainCircuit className="w-8 h-8 text-accent" />,
        image: "https://placehold.co/600x400.png",
        imageHint: "meditation yoga",
        duration: "10 min"
    },
    {
        title: "Box Breathing",
        description: "A simple but powerful technique to regulate your breath and nervous system.",
        icon: <Wind className="w-8 h-8 text-accent" />,
        image: "https://placehold.co/600x400.png",
        imageHint: "breathing nature",
        duration: "5 min"
    },
    {
        title: "Mindful Listening",
        description: "Tune into the sounds around you and practice being present in the moment.",
        icon: <Ear className="w-8 h-8 text-accent" />,
        image: "https://placehold.co/600x400.png",
        imageHint: "nature listening",
        duration: "15 min"
    }
]

function ZenZoneContent() {
    return (
        <main className="p-4 lg:p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <BrainCircuit className="text-primary"/>
                        Zen Zone
                    </CardTitle>
                    <CardDescription>
                        Find your center and recharge with these mindfulness activities.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {zenActivities.map(activity => (
                             <Card key={activity.title} className="flex flex-col">
                                <CardHeader className="flex-row items-start gap-4 space-y-0">
                                    {activity.icon}
                                    <div>
                                        <CardTitle className="font-headline">{activity.title}</CardTitle>
                                        <CardDescription>{activity.description}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                     <div className="aspect-video overflow-hidden rounded-lg">
                                        <Image
                                            src={activity.image}
                                            alt={activity.title}
                                            width={600}
                                            height={400}
                                            data-ai-hint={activity.imageHint}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">{activity.duration}</span>
                                    <Button variant="outline">
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        Begin
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}

export default function ZenZonePage() {
  return (
    <UserProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex items-center justify-between p-4 border-b">
               <SidebarTrigger className="md:hidden"/>
               <h1 className="text-2xl font-headline font-semibold">Zen Zone</h1>
            </header>
            <ZenZoneContent />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}
