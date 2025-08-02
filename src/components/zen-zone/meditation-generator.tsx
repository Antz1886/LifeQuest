
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Wand2, Loader2, Library, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateMeditation } from '@/ai/flows/generate-meditation-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/context/user-context';
import type { SavedMeditation } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

function Generator({ onGenerated }: { onGenerated: (result: { script: string; audioDataUri: string, prompt: string }) => void }) {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast({
                title: "Prompt is empty",
                description: "Please describe the meditation you'd like to generate.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const meditationResult = await generateMeditation({ prompt });
            onGenerated({ ...meditationResult, prompt });
            toast({
                title: "Meditation Generated!",
                description: "Your new session has been saved to your library.",
            });
            setPrompt("");
        } catch (error) {
            console.error("Failed to generate meditation:", error);
            toast({
                title: "Generation Failed",
                description: "There was an error generating your meditation. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Textarea
                placeholder="e.g., 'A 5-minute session to calm anxiety' or 'A 10-minute meditation for focus'"
                className="min-h-[100px] text-base"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
            />
            <Button
                onClick={handleGenerate}
                disabled={isLoading}
                size="lg"
                className="w-full"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Your Session...
                    </>
                ) : (
                    <>
                       <Wand2 className="mr-2 h-4 w-4" />
                       Generate & Save Meditation
                    </>
                )}
            </Button>
        </div>
    );
}

function MeditationPlayer({ meditation }: { meditation: SavedMeditation }) {
    return (
        <div className="space-y-4 p-4 border-t">
             <div>
                <h4 className="font-semibold">Listen:</h4>
                 <audio controls className="w-full mt-2">
                    <source src={meditation.audioDataUri} type="audio/wav" />
                    Your browser does not support the audio element.
                </audio>
            </div>
             <div>
                <h4 className="font-semibold">Script:</h4>
                <ScrollArea className="h-48 w-full rounded-md border p-4 bg-muted/30 mt-2">
                   <p className="whitespace-pre-wrap font-body leading-relaxed text-sm">{meditation.script}</p>
                </ScrollArea>
            </div>
        </div>
    )
}


export function MeditationGenerator() {
    const { savedMeditations, addSavedMeditation } = useUser();
    const [isGeneratorVisible, setIsGeneratorVisible] = useState(savedMeditations.length === 0);

    const handleGenerated = (result: { script: string; audioDataUri: string, prompt: string }) => {
        addSavedMeditation(result);
        setIsGeneratorVisible(false);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                            <Library className="text-primary"/>
                            Your Library
                        </CardTitle>
                        <CardDescription>
                            Your saved meditation sessions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {savedMeditations.length > 0 ? (
                             <Accordion type="single" collapsible className="w-full">
                                {savedMeditations.map((meditation) => (
                                    <AccordionItem value={meditation.id} key={meditation.id}>
                                        <AccordionTrigger>
                                            <div className="text-left">
                                                <p className="font-medium truncate">{meditation.prompt}</p>
                                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(meditation.createdAt, { addSuffix: true })}</p>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <MeditationPlayer meditation={meditation} />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                             <div className="text-center py-8 px-4 text-muted-foreground">
                                <p>Your generated meditations will be saved here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                             <CardTitle className="font-headline text-2xl flex items-center gap-2">
                                <BrainCircuit className="text-primary"/>
                                AI Meditation Generator
                            </CardTitle>
                             {savedMeditations.length > 0 && (
                                <Button variant="outline" size="sm" onClick={() => setIsGeneratorVisible(!isGeneratorVisible)}>
                                    {isGeneratorVisible ? 'Close' : <><PlusCircle className="w-4 h-4 mr-2"/>New Session</>}
                                </Button>
                             )}
                        </div>
                        <CardDescription>
                           {isGeneratorVisible 
                           ? "Describe the kind of meditation you need, and the AI will create and save a unique guided session just for you."
                           : "Create a new meditation session or select one from your library."
                           }
                        </CardDescription>
                    </CardHeader>
                    {isGeneratorVisible && (
                        <CardContent>
                            <Generator onGenerated={handleGenerated}/>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}
