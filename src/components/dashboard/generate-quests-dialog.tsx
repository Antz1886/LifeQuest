
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2, RefreshCw, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { useUser } from '@/context/user-context';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { generateQuests } from '@/ai/flows/generate-quests-flow';
import { fetchGoogleCalendarEvents, fetchOutlookCalendarEvents, CalendarEvent } from '@/services/calendar';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

export function GenerateQuestsDialog() {
    const [open, setOpen] = useState(false);
    const [goals, setGoals] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncedEvents, setSyncedEvents] = useState<CalendarEvent[]>([]);
    const [syncSource, setSyncSource] = useState<'google' | 'outlook' | null>(null);
    const { setQuests, projects } = useUser();
    const { accessToken, signInWithGoogle } = useAuth();
    const { toast } = useToast();

    const handleSyncGoogle = async () => {
        if (!accessToken) {
            toast({
                title: "Reconnect Required",
                description: "Please sign in again to authorize calendar access.",
            });
            await signInWithGoogle();
            return;
        }

        setIsSyncing(true);
        try {
            const events = await fetchGoogleCalendarEvents(accessToken);
            setSyncedEvents(events);
            setSyncSource('google');
            toast({
                title: "Google Calendar Synced",
                description: `Found ${events.length} upcoming events.`,
            });
        } catch (error) {
            console.error("Google Sync failed:", error);
            toast({
                title: "Sync Failed",
                description: "Could not fetch Google Calendar events.",
                variant: "destructive",
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSyncOutlook = async () => {
        setIsSyncing(true);
        try {
            const events = await fetchOutlookCalendarEvents();
            setSyncedEvents(events);
            setSyncSource('outlook');
            toast({
                title: "Outlook Synced (Mock)",
                description: `Found ${events.length} events from Outlook.`,
            });
        } catch (error) {
            console.error("Outlook Sync failed:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            // Pass active projects to the AI flow
            const activeProjects = projects.filter(p => p.tasks.some(t => !t.isCompleted));

            const { quests } = await generateQuests({ 
                goals,
                location: 'Mountain View, CA',
                activeProjects: activeProjects,
                calendarEvents: syncedEvents,
             });
            setQuests(quests);
            toast({
                title: "Quests Generated!",
                description: "Your new quests (including calendar events) are ready.",
            });
            setOpen(false);
            setGoals("");
            setSyncedEvents([]);
            setSyncSource(null);
        } catch (error) {
            console.error("Failed to generate quests:", error);
            toast({
                title: "Generation Failed",
                description: "There was an error generating your quests. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                    <Wand2 className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Generate with AI</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2"><Wand2 />AI Quest Generation</DialogTitle>
                    <DialogDescription>
                        Describe your main goals, or let the AI suggest quests based on your active projects.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex flex-col gap-3">
                        <Label className="text-sm font-semibold">External Data Sync</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className={cn("gap-2 border-dashed", syncSource === 'google' && "border-primary bg-primary/5")}
                                onClick={handleSyncGoogle}
                                disabled={isSyncing || isLoading}
                            >
                                {isSyncing && syncSource === 'google' ? <RefreshCw className="w-4 h-4 animate-spin"/> : <CalendarIcon className="w-4 h-4 text-orange-500"/>}
                                Google {syncedEvents.length > 0 && syncSource === 'google' && <CheckCircle2 className="w-3 h-3 text-green-500"/>}
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className={cn("gap-2 border-dashed", syncSource === 'outlook' && "border-primary bg-primary/5")}
                                onClick={handleSyncOutlook}
                                disabled={isSyncing || isLoading}
                            >
                                <CalendarIcon className="w-4 h-4 text-blue-500"/>
                                Outlook {syncedEvents.length > 0 && syncSource === 'outlook' && <CheckCircle2 className="w-3 h-3 text-green-500"/>}
                            </Button>
                        </div>
                        {syncedEvents.length > 0 && (
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500"/> 
                                {syncedEvents.length} events synced from {syncSource === 'google' ? 'Google' : 'Outlook'}. AI will process these.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Custom Intentions</Label>
                        <Textarea
                            placeholder="e.g., 'Learn about Next.js server components' or leave blank to use synced data."
                            className="min-h-[100px]"
                            value={goals}
                            onChange={(e) => setGoals(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Forging Quests...
                            </>
                        ) : (
                            'Generate Quests'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
