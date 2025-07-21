
"use client";

import { useUser } from "@/context/user-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Star } from "lucide-react";

export function UserProfileCard() {
    const { profile } = useUser();
    const xpPercentage = (profile.xp / profile.xpToNextLevel) * 100;

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
                    <AvatarImage src={profile.avatarUrl || ''} alt={profile.name} />
                    <AvatarFallback className="text-4xl">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="font-headline text-3xl">{profile.name}</CardTitle>
                <CardDescription className="text-primary font-semibold text-lg">{profile.title || 'Adventurer'}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
                <div>
                     <div className="flex justify-between items-center mb-1 text-sm font-medium">
                        <span className="text-accent">Level {profile.level}</span>
                        <span>{profile.xp} / {profile.xpToNextLevel} XP</span>
                    </div>
                    <Progress value={xpPercentage} className="h-3 [&>div]:bg-accent" />
                </div>
                <div>
                    <h3 className="font-headline text-lg mb-2">Current Streaks</h3>
                    <div className="flex justify-center gap-4">
                        <Badge variant="secondary" className="gap-1.5 py-1 px-3 text-base">
                            <Flame className="w-4 h-4 text-orange-400" /> {profile.streaks.gym} Gym
                        </Badge>
                        <Badge variant="secondary" className="gap-1.5 py-1 px-3 text-base">
                            <Flame className="w-4 h-4 text-blue-400" /> {profile.streaks.code} Code
                        </Badge>
                        <Badge variant="secondary" className="gap-1.5 py-1 px-3 text-base">
                             <Flame className="w-4 h-4 text-purple-400" /> {profile.streaks.meditation} Mind
                        </Badge>
                    </div>
                </div>
            </CardContent>
             <CardFooter className="flex justify-center">
                 <Badge variant="outline" className="gap-1.5 py-1 px-3">
                    <Star className="w-4 h-4 text-yellow-400"/>
                    Level {profile.level}
                 </Badge>
             </CardFooter>
        </Card>
    );
}
