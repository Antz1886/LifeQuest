
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Wand2, Loader2, Library, PlusCircle, Play, Pause, Square, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateMeditation } from '@/ai/flows/generate-meditation-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/context/user-context';
import type { SavedMeditation } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const presets = [
  { label: "🧘 Calm Anxiety", prompt: "A 5-minute breathing session to reduce anxiety and stress." },
  { label: "🧠 Deep Focus", prompt: "A 10-minute mindfulness practice to sharpen mental clarity and focus." },
  { label: "😴 Deep Sleep", prompt: "A 15-minute body scan meditation for deep sleep and relaxation." },
  { label: "✨ Morning Gratitude", prompt: "A 3-minute morning visualization focusing on gratitude and energy." }
];

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
            <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Quick Presets:</span>
                <div className="flex flex-wrap gap-2 mb-3">
                    {presets.map((preset, index) => (
                        <button
                            key={index}
                            onClick={() => setPrompt(preset.prompt)}
                            disabled={isLoading}
                            className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 active:scale-95 transition-all text-primary-foreground font-semibold"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>
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
    const { toast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [rate, setRate] = useState(0.85); // Default to slightly slower, soothing rate

    const playSpeech = () => {
        if (typeof window === 'undefined' || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {
            toast({
                title: "Voice Reader Unavailable",
                description: "Your browser or device does not support Web Speech synthesis.",
                variant: "destructive"
            });
            return;
        }

        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPlaying(true);
            setIsPaused(false);
            return;
        }

        // Cancel any active speaking
        window.speechSynthesis.cancel();

        const utterance = new window.SpeechSynthesisUtterance(meditation.script);
        utterance.rate = rate;

        // Find a suitable English voice, preferably a natural or female voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
            v.name.includes("Google US English") || 
            v.name.includes("Natural") || 
            v.lang.startsWith("en")
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };

        utterance.onerror = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };

        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setIsPaused(false);
    };

    const pauseSpeech = () => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.pause();
        setIsPlaying(false);
        setIsPaused(true);
    };

    const stopSpeech = () => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
    };

    // Clean up when unmounting
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return (
        <div className="space-y-4 p-4 border-t">
             <div className="bg-muted/40 p-4 rounded-xl border border-border/40 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-primary" /> AI Voice Reader
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">Speed: {rate}x</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                        {!isPlaying ? (
                            <Button onClick={playSpeech} size="sm" className="rounded-xl h-9 px-4 gap-1.5 font-semibold">
                                <Play className="w-3.5 h-3.5 fill-current" /> {isPaused ? "Resume" : "Start Listening"}
                            </Button>
                        ) : (
                            <Button onClick={pauseSpeech} size="sm" variant="secondary" className="rounded-xl h-9 px-4 gap-1.5 font-semibold">
                                <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                            </Button>
                        )}
                        {(isPlaying || isPaused) && (
                            <Button onClick={stopSpeech} size="sm" variant="outline" className="rounded-xl h-9 w-9 p-0 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive">
                                <Square className="w-3.5 h-3.5 fill-current" />
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:max-w-[150px]">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground shrink-0">Slow</span>
                        <Slider 
                            value={[rate]} 
                            min={0.6} 
                            max={1.2} 
                            step={0.05} 
                            onValueChange={(val) => {
                                setRate(val[0]);
                            }}
                            onValueCommit={(val) => {
                                // If speaking, restart with the new rate for immediate effect
                                if (isPlaying) {
                                    setTimeout(() => playSpeech(), 50);
                                }
                            }}
                            className="flex-1"
                        />
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground shrink-0">Fast</span>
                    </div>
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Meditation Script:</h4>
                <ScrollArea className="h-48 w-full rounded-md border p-4 bg-muted/20">
                   <p className="whitespace-pre-wrap font-body leading-relaxed text-sm text-foreground/90">{meditation.script}</p>
                </ScrollArea>
            </div>
        </div>
    );
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
            <div className="lg:col-span-1 order-2 lg:order-1">
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

            <div className="lg:col-span-2 order-1 lg:order-2">
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
