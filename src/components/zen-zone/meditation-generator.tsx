
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Wand2, Loader2, PlayCircle, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateMeditation } from '@/ai/flows/generate-meditation-flow';
import { ScrollArea } from '@/components/ui/scroll-area';

export function MeditationGenerator() {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ script: string; audioDataUri: string } | null>(null);
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
        setResult(null);
        try {
            const meditationResult = await generateMeditation({ prompt });
            setResult(meditationResult);
            toast({
                title: "Meditation Generated!",
                description: "Your personalized meditation is ready.",
            });
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
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <BrainCircuit className="text-primary"/>
                    AI Meditation Generator
                </CardTitle>
                <CardDescription>
                    Describe the kind of meditation you need, and the AI will create a unique guided session just for you.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Textarea
                    placeholder="e.g., 'A 5-minute session to calm anxiety before a meeting' or 'A 10-minute meditation to help me fall asleep'"
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
                           Generate Meditation
                        </>
                    )}
                </Button>
            </CardContent>

            {result && (
                <CardFooter className="flex flex-col items-start gap-6 pt-6 border-t">
                    <div className="w-full">
                        <h3 className="font-headline text-xl mb-4 text-accent">Listen to Your Meditation</h3>
                         <audio controls className="w-full">
                            <source src={result.audioDataUri} type="audio/wav" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                     <div className="w-full">
                        <h3 className="font-headline text-xl mb-4 text-accent">Meditation Script</h3>
                        <ScrollArea className="h-72 w-full rounded-md border p-4 bg-muted/30">
                           <p className="whitespace-pre-wrap font-body leading-relaxed">{result.script}</p>
                        </ScrollArea>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
