
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
import { Flame, Dumbbell, Heart, Briefcase, Laptop } from 'lucide-react';

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50 shadow-sm">
            <Heart className="w-8 h-8 text-purple-400 shrink-0"/>
            <div>
              <p className="font-bold text-lg">{profile.streaks.personal} Days</p>
              <p className="text-xs text-muted-foreground">Personal</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50 shadow-sm">
            <Briefcase className="w-8 h-8 text-blue-400 shrink-0"/>
            <div>
              <p className="font-bold text-lg">{profile.streaks.work} Days</p>
              <p className="text-xs text-muted-foreground">Work</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50 shadow-sm">
            <Laptop className="w-8 h-8 text-green-400 shrink-0"/>
            <div>
              <p className="font-bold text-lg">{profile.streaks.freelancing} Days</p>
              <p className="text-xs text-muted-foreground">Freelance</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50 shadow-sm">
            <Dumbbell className="w-8 h-8 text-orange-400 shrink-0"/>
            <div>
              <p className="font-bold text-lg">{profile.streaks.mindBody} Days</p>
              <p className="text-xs text-muted-foreground">Mind & Body</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
