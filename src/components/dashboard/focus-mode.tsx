
"use client";

import { useState, useEffect, ReactNode } from 'react';
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
import { Play, Pause, RotateCcw, Coffee, BrainCircuit } from 'lucide-react';
import type { Quest } from '@/lib/types';

const FOCUS_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60; // 5 minutes

export function FocusMode({ children, quest }: { children: ReactNode, quest: Quest }) {
    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
    const [isActive, setIsActive] = useState(false);
    const [showBreakMessage, setShowBreakMessage] = useState(false);
    const [showFocusMessage, setShowFocusMessage] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (mode === 'focus') {
                setMode('break');
                setTimeLeft(BREAK_TIME);
                setShowBreakMessage(true);
            } else {
                setMode('focus');
                setTimeLeft(FOCUS_TIME);
                setShowFocusMessage(true);
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, mode]);
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setIsActive(false);
        } else {
            resetTimer();
        }
    };

    const toggleTimer = () => {
        setIsActive(!isActive)
        setShowBreakMessage(false);
        setShowFocusMessage(false);
    };

    const resetTimer = () => {
        setIsActive(false);
        setMode('focus');
        setTimeLeft(FOCUS_TIME);
        setShowBreakMessage(false);
        setShowFocusMessage(false);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const totalTime = mode === 'focus' ? FOCUS_TIME : BREAK_TIME;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    return (
        <Dialog onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-primary/20">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl text-primary">{mode === 'focus' ? 'Focus Mode' : 'Break Time'}</DialogTitle>
                    <DialogDescription>
                        Focusing on: <span className="font-semibold text-accent">{quest.title}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center space-y-4 py-6">
                     <div className="relative w-48 h-48 mb-4">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                           <circle className="text-muted-foreground/20" strokeWidth="7" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                           <circle
                            className={mode === 'focus' ? "text-accent" : "text-green-500"}
                            strokeWidth="7"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={(2 * Math.PI * 45) - (progress / 100) * (2 * Math.PI * 45)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                            transform="rotate(-90 50 50)"
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-5xl font-mono font-bold text-foreground">
                                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {quest.notes && (
                        <div className="w-full mt-2 mb-4 p-3 rounded-xl bg-muted/50 border border-border/50 max-h-32 overflow-y-auto scrollbar-hide">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Quest Notes</p>
                            <p className="text-xs text-foreground/80 whitespace-pre-wrap">{quest.notes}</p>
                        </div>
                    )}

                    {showBreakMessage && (
                        <div className="text-center p-3 rounded-lg bg-muted border border-green-500/50">
                            <p className="font-semibold flex items-center gap-2"><Coffee className="text-green-500"/> Break time!</p>
                            <p className="text-sm text-muted-foreground">Time for a short break. You've earned it!</p>
                        </div>
                    )}
                    {showFocusMessage && (
                        <div className="text-center p-3 rounded-lg bg-muted border border-accent/50">
                             <p className="font-semibold flex items-center gap-2"><BrainCircuit className="text-accent"/> Focus time!</p>
                             <p className="text-sm text-muted-foreground">Break's over. Let's get back to it!</p>
                        </div>
                    )}
                </div>
                <DialogFooter className="flex-row justify-center items-center gap-4">
                     <Button onClick={resetTimer} variant="ghost" size="icon" className="w-12 h-12">
                        <RotateCcw />
                    </Button>
                    <Button onClick={toggleTimer} variant="default" size="icon" className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90">
                        {isActive ? <Pause className="w-8 h-8"/> : <Play className="w-8 h-8" />}
                    </Button>
                    <div className="w-12 h-12"></div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
