
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";
import Image from 'next/image';
import { generateProfileCustomization } from '@/ai/flows/generate-profile-customization-flow';

export function ProfileCustomizer() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { profile, quests, updateProfileCustomization } = useUser();
    const completedQuests = quests.filter(q => q.isCompleted);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const result = await generateProfileCustomization({
                profile: {
                    name: profile.name,
                    level: profile.level,
                    xp: profile.xp,
                    xpToNextLevel: profile.xpToNextLevel,
                    streaks: profile.streaks,
                },
                completedQuests
            });
            updateProfileCustomization(result.title, result.avatarDataUri);
            toast({
                title: "Profile Updated!",
                description: `You've earned the title: ${result.title}`,
            });
        } catch (error) {
            console.error("Failed to generate profile customization:", error);
            toast({
                title: "Generation Failed",
                description: "Could not generate a new title and avatar. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Sparkles className="text-primary"/>
                    Customize Your Profile
                </CardTitle>
                <CardDescription>
                    Use AI to generate a new title and avatar based on your recent accomplishments. Show the world who you are!
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
                <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {isLoading ? (
                         <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    ) : (
                        profile.avatarUrl ? (
                            <Image src={profile.avatarUrl} alt="Generated Avatar" width={512} height={512} className="object-cover w-full h-full"/>
                        ) : (
                            <div className="text-muted-foreground text-center p-8">
                                <Sparkles className="w-16 h-16 mx-auto mb-4" />
                                <p>Your generated avatar will appear here.</p>
                            </div>
                        )
                    )}
                </div>
                 <Button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    size="lg"
                    className="w-full"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Identity...
                        </>
                    ) : (
                        <>
                           <Wand2 className="mr-2 h-4 w-4" />
                           Forge New Title & Avatar
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
