
"use client";

import Link from 'next/link';
import { useUser } from '@/context/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { MoreVertical, LayoutGrid, Map, BarChart3, BrainCircuit, Settings, LogOut } from 'lucide-react';

export function AppHeader({ title }: { title: string }) {
    const { profile, isLoaded } = useUser();
    const xpPercentage = (profile.xp / profile.xpToNextLevel) * 100;

    const displayName = isLoaded ? profile.name : 'Adventurer';
    const displayAvatar = isLoaded ? profile.avatarUrl : '';

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
            <div className="flex items-center gap-3">
                 <h1 className="text-xl font-headline font-semibold">{title}</h1>
            </div>
           
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                 <div className="ml-auto flex-1 sm:flex-initial">
                    <div className="w-full max-w-[200px] ml-auto">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-primary">Lvl {profile.level}</span>
                            <span className="text-xs text-muted-foreground">{profile.xp} / {profile.xpToNextLevel} XP</span>
                        </div>
                        <Progress value={xpPercentage} className="h-2 [&>div]:bg-primary" />
                    </div>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative w-8 h-8 rounded-full">
                           <Avatar>
                                <AvatarImage src={displayAvatar || ''} alt={displayName}/>
                                <AvatarFallback>{displayName.charAt(0) || 'A'}</AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href="/profile" passHref><DropdownMenuItem>Profile</DropdownMenuItem></Link>
                        <DropdownMenuItem disabled>Settings</DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <Link href="/weekly-map" passHref><DropdownMenuItem>Weekly Map</DropdownMenuItem></Link>
                         <Link href="/progress-log" passHref><DropdownMenuItem>Progress Log</DropdownMenuItem></Link>
                         <Link href="/zen-zone" passHref><DropdownMenuItem>Zen Zone</DropdownMenuItem></Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
