
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
import { Wand2, Loader2 } from 'lucide-react';
import { useUser } from '@/context/user-context';
import { useToast } from '@/hooks/use-toast';
import { generateQuests } from '@/ai/flows/generate-quests-flow';

export function GenerateQuestsDialog() {
    const [open, setOpen] = useState(false);
    const [goals, setGoals] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { setQuests, projects } = useUser();
    const { toast } = useToast();

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            // Pass active projects to the AI flow
            const activeProjects = projects.filter(p => p.tasks.some(t => !t.isCompleted));

            const { quests } = await generateQuests({ 
                goals,
                location: 'Mountain View, CA', // You could make this dynamic in a real app
                activeProjects: activeProjects,
             });
            setQuests(quests);
            toast({
                title: "Quests Generated!",
                description: "Your new quests are ready on the board.",
            });
            setOpen(false);
            setGoals("");
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
                <div className="py-4">
                    <Textarea
                        placeholder="e.g., 'Finish my project presentation, hit the gym for a leg day, and learn about Next.js server components.' (Optional if you have active projects)"
                        className="min-h-[120px]"
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        disabled={isLoading}
                    />
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
