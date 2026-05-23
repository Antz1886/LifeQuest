"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2, Sparkles, AlertTriangle, User, Palette, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";
import Image from 'next/image';
import { generateProfileCustomization } from '@/ai/flows/generate-profile-customization-flow';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const themesList = [
  { id: 'default', name: 'Slate Dusk', bg: 'bg-[#212121]', primary: 'bg-[#9333ea]', accent: 'bg-[#a7f3d0]' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', bg: 'bg-[#0f0a1c]', primary: 'bg-[#df30ff]', accent: 'bg-[#00f3ff]' },
  { id: 'forest', name: 'Forest Zen', bg: 'bg-[#0a120e]', primary: 'bg-[#15803d]', accent: 'bg-[#a3e635]' },
  { id: 'ocean', name: 'Oceanic Depths', bg: 'bg-[#060f1e]', primary: 'bg-[#0ea5e9]', accent: 'bg-[#14b8a6]' },
  { id: 'cosmic', name: 'Cosmic Nebula', bg: 'bg-[#0a061a]', primary: 'bg-[#a855f7]', accent: 'bg-[#ec4899]' },
  { id: 'sunset', name: 'Sunset Glow', bg: 'bg-[#120805]', primary: 'bg-[#f97316]', accent: 'bg-[#eab308]' },
  { id: 'minimal', name: 'Carbon Minimalist', bg: 'bg-[#0c0c0c]', primary: 'bg-[#fafafa]', accent: 'bg-[#6b7280]' },
];

export function ProfileCustomizer() {
    const [isLoading, setIsLoading] = useState(false);
    const [avatarPrompt, setAvatarPrompt] = useState("");
    const { toast } = useToast();
    const { profile, quests, updateProfile, resetProgress } = useUser();
    const completedQuests = quests.filter(q => q.isCompleted);

    // Form inputs state
    const [displayName, setDisplayName] = useState(profile.name);
    const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
    const [selectedTheme, setSelectedTheme] = useState(profile.theme || "default");

    // Sync input states when profile loads
    useEffect(() => {
        if (profile) {
            setDisplayName(profile.name);
            setAvatarUrl(profile.avatarUrl || "");
            setSelectedTheme(profile.theme || "default");
        }
    }, [profile]);

    const handleSaveManualSettings = async () => {
        try {
            await updateProfile({
                name: displayName,
                avatarUrl: avatarUrl,
                theme: selectedTheme
            });
            toast({
                title: "Profile Saved",
                description: "Your display settings have been updated.",
            });
        } catch (error) {
            console.error("Save manual profile failed", error);
            toast({
                title: "Update Failed",
                description: "Could not update profile data.",
                variant: "destructive"
            });
        }
    };

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
                completedQuests,
                avatarPrompt: avatarPrompt || undefined,
            });
            await updateProfile({
                title: result.title,
                avatarUrl: result.avatarDataUri
            });
            toast({
                title: "Identity Forged!",
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
        <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <User className="text-primary"/>
                        Profile Settings
                    </CardTitle>
                    <CardDescription>
                        Update your public display identity.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input 
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="e.g. Hero"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="avatarUrl">Avatar Image URL</Label>
                            <Input 
                                id="avatarUrl"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="e.g. https://image.url"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveManualSettings} className="ml-auto">
                        Save Display Settings
                    </Button>
                </CardFooter>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Palette className="text-primary"/>
                        Platform Themes
                    </CardTitle>
                    <CardDescription>
                        Customize backgrounds, navigation elements, and interactive colors.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {themesList.map((t) => {
                            const isActive = selectedTheme === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTheme(t.id)}
                                    className={`relative flex flex-col p-3 rounded-2xl border text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                                        isActive 
                                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5' 
                                            : 'border-border/60 bg-muted/40 hover:bg-muted/60'
                                    }`}
                                >
                                    <span className="text-xs font-semibold mb-3 truncate">{t.name}</span>
                                    <div className={`w-full h-8 rounded-lg ${t.bg} border border-white/5 flex gap-1 items-center justify-center p-1`}>
                                        <div className={`w-3 h-3 rounded-full ${t.primary}`} />
                                        <div className={`w-3 h-3 rounded-full ${t.accent}`} />
                                    </div>
                                    {isActive && (
                                        <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveManualSettings} className="ml-auto">
                        Apply Active Theme
                    </Button>
                </CardFooter>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Sparkles className="text-primary"/>
                        AI Identity Forge
                    </CardTitle>
                    <CardDescription>
                        Forge an AI-generated title and avatar based on your accomplishments.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="w-full aspect-[2/1] max-w-md mx-auto bg-muted/30 border border-border/40 rounded-2xl flex items-center justify-center overflow-hidden">
                        {isLoading ? (
                             <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        ) : (
                            profile.avatarUrl ? (
                                <Image src={profile.avatarUrl} alt="Generated Avatar" width={512} height={256} className="object-cover w-full h-full" unoptimized/>
                            ) : (
                                <div className="text-muted-foreground text-center p-6">
                                    <Sparkles className="w-12 h-12 mx-auto mb-2 text-primary/60" />
                                    <p className="text-sm">Your avatar image will be forged here.</p>
                                </div>
                            )
                        )}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="avatarPrompt">Prompt Guide (Optional)</Label>
                        <Input 
                            id="avatarPrompt"
                            placeholder="e.g. 'a cyber warrior wearing glasses'"
                            value={avatarPrompt}
                            onChange={(e) => setAvatarPrompt(e.target.value)}
                            disabled={isLoading}
                        />
                     </div>
                </CardContent>
                <CardFooter>
                     <Button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Forging Identity...
                            </>
                        ) : (
                            <>
                               <Wand2 className="mr-2 h-4 w-4" />
                               Forge Title & Avatar
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-xl text-red-400 flex items-center gap-2">
                        <ShieldAlert />
                        Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-400/80">
                        Resetting score counters is a destructive, permanent action.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This action will instantly reset your level back to 1, clear all XP to 0, reset your quest streaks, and permanently delete your entire quest board history.
                    </p>
                </CardContent>
                <CardFooter>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full sm:w-auto">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Reset Quest Score Counters
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will wipe your Level, XP, Streaks, and delete all quests from your board. This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={resetProgress} className="bg-destructive hover:bg-destructive/90">
                                    Yes, Reset Everything
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
    );
}
