
"use client";

import Link from 'next/link';
import { useUser } from '@/context/user-context';
import { useAuth } from '@/context/auth-context';
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
import { Map, BarChart3, BrainCircuit, LogOut, Flame } from 'lucide-react';

export function AppHeader({ title }: { title: string }) {
    const { profile, isLoaded: isUserLoaded } = useUser();
    const { user: authUser, logout, loading: isAuthLoading } = useAuth();
    const xpPercentage = (profile.xp / profile.xpToNextLevel) * 100;

    const isLoaded = isUserLoaded && !isAuthLoading;

    const displayName = isLoaded ? (authUser?.displayName || profile.name || 'Adventurer') : 'Adventurer';
    const displayAvatar = isLoaded ? (authUser?.photoURL || profile.avatarUrl || '') : '';

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
            <div className="flex items-center gap-2">
                 <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Flame className="w-7 h-7 text-primary" />
                    <span className="text-xl font-headline font-bold tracking-tight hidden sm:inline-block">LifeQuest</span>
                </Link>
                 <div className="h-6 w-px bg-border hidden sm:block mx-2" />
                 <h1 className="text-xl font-headline font-semibold text-muted-foreground">{title}</h1>
            </div>
           
            <div className="flex flex-grow items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                 <div className="ml-auto flex items-center gap-4">
                    <div className="hidden sm:block w-full max-w-[200px]">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-primary">Lvl {profile.level}</span>
                            <span className="text-xs text-muted-foreground">{profile.xp} / {profile.xpToNextLevel} XP</span>
                        </div>
                        <Progress value={xpPercentage} className="h-2 [&>div]:bg-primary" />
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="relative w-9 h-9 rounded-full">
                               <Avatar className="w-9 h-9">
                                    <AvatarImage src={displayAvatar || ''} alt={displayName}/>
                                    <AvatarFallback>{displayName.charAt(0) || 'A'}</AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href="/profile" passHref><DropdownMenuItem>Profile</DropdownMenuItem></Link>
                             <DropdownMenuSeparator />
                             <Link href="/weekly-map" passHref><DropdownMenuItem><Map className="mr-2 h-4 w-4"/>Weekly Map</DropdownMenuItem></Link>
                             <Link href="/progress-log" passHref><DropdownMenuItem><BarChart3 className="mr-2 h-4 w-4"/>Progress Log</DropdownMenuItem></Link>
                             <Link href="/zen-zone" passHref><DropdownMenuItem><BrainCircuit className="mr-2 h-4 w-4"/>Zen Zone</DropdownMenuItem></Link>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={logout} className="text-red-400 focus:text-red-400">
                                 <LogOut className="mr-2 h-4 w-4"/>
                                 Sign Out
                             </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
