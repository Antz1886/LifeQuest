"use client";

import { useUser } from "@/context/user-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Dumbbell, BookOpen, BrainCircuit } from 'lucide-react';

export function UserStats() {
  const { profile } = useUser();
  const xpPercentage = (profile.xp / profile.xpToNextLevel) * 100;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-3xl text-primary">{profile.name}'s Progress</CardTitle>
                <CardDescription>Keep pushing, your legacy is being built!</CardDescription>
            </div>
            <div className="text-center bg-primary/10 border border-primary/30 rounded-lg px-4 py-2">
                <p className="font-headline text-3xl font-bold text-accent">{profile.level}</p>
                <p className="text-sm font-medium text-primary-foreground/80 -mt-1">LEVEL</p>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1 text-sm font-medium">
            <span className="text-accent">XP: {profile.xp} / {profile.xpToNextLevel}</span>
            <span>Next Level</span>
          </div>
          <Progress value={xpPercentage} className="h-3 [&>div]:bg-accent" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
            <TrendingUp className="w-8 h-8 text-primary"/>
            <div>
              <p className="font-bold text-lg">{profile.streaks.gym} Days</p>
              <p className="text-sm text-muted-foreground">Gym Streak</p>
            </div>
          </div>
           <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
            <Dumbbell className="w-8 h-8 text-primary"/>
            <div>
              <p className="font-bold text-lg">Fitness</p>
              <p className="text-sm text-muted-foreground">Buff Badge</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
            <BookOpen className="w-8 h-8 text-primary"/>
            <div>
              <p className="font-bold text-lg">{profile.streaks.code} Days</p>
              <p className="text-sm text-muted-foreground">Code Streak</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
            <BrainCircuit className="w-8 h-8 text-primary"/>
            <div>
              <p className="font-bold text-lg">{profile.streaks.meditation} Days</p>
              <p className="text-sm text-muted-foreground">Mindful Streak</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
