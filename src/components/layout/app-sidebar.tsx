
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarProvider
} from "@/components/ui/sidebar";
import {
  Flame,
  LayoutGrid,
  Map,
  BarChart3,
  Archive,
  BrainCircuit,
  Settings,
  User,
  Calendar,
} from "lucide-react";
import { useUser } from '@/context/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';


function AppSidebarContent() {
    const pathname = usePathname();
    const { profile, isLoaded } = useUser();
  
    const displayName = isLoaded ? profile.name : 'Adventurer';
    const displayAvatar = isLoaded ? profile.avatarUrl : '';
    return (
        <>
            <SidebarHeader className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 p-2">
                    <Flame className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-headline font-semibold group-data-[collapsible=icon]:hidden">LifeQuest</span>
                </Link>
                <SidebarTrigger className="hidden md:flex" />
            </SidebarHeader>
            <SidebarMenu className="flex-1">
                <SidebarMenuItem>
                <Link href="/" passHref>
                    <SidebarMenuButton tooltip="Dashboard" isActive={pathname === '/'}>
                    <LayoutGrid />
                    <span>Dashboard</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                <Link href="/calendar" passHref>
                    <SidebarMenuButton tooltip="Calendar" isActive={pathname === '/calendar'}>
                    <Calendar />
                    <span>Calendar</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <Link href="/weekly-map" passHref>
                    <SidebarMenuButton tooltip="Weekly Map" isActive={pathname === '/weekly-map'}>
                    <Map />
                    <span>Weekly Map</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <Link href="/progress-log" passHref>
                    <SidebarMenuButton tooltip="Progress" isActive={pathname === '/progress-log'}>
                    <BarChart3 />
                    <span>Progress Log</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <Link href="/project-vault" passHref>
                    <SidebarMenuButton tooltip="Project Vault" isActive={pathname === '/project-vault'}>
                        <Archive />
                        <span>Project Vault</span>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <Link href="/zen-zone" passHref>
                    <SidebarMenuButton tooltip="Zen Zone" isActive={pathname === '/zen-zone'}>
                    <BrainCircuit />
                    <span>Zen Zone</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            </SidebarMenu>
            <SidebarFooter>
                <SidebarMenuItem>
                <Link href="/profile" passHref>
                    <SidebarMenuButton tooltip="Profile" isActive={pathname === '/profile'}>
                        <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                                <AvatarImage src={displayAvatar || ''} alt={displayName}/>
                                <AvatarFallback>{displayName.charAt(0) || 'A'}</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{displayName}</span>
                        </div>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" disabled>
                    <Settings />
                    <span>Settings</span>
                </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarFooter>
      </>
    )
}

function BottomNavBar() {
    const pathname = usePathname();
    const navItems = [
        { href: "/", label: "Dashboard", icon: LayoutGrid },
        { href: "/calendar", label: "Calendar", icon: Calendar },
        { href: "/project-vault", label: "Projects", icon: Archive },
    ];
    return (
        <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border">
            <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
                {navItems.map(({href, label, icon: Icon}) => (
                    <Link href={href} key={label} passHref>
                        <button type="button" className={`inline-flex flex-col items-center justify-center px-5 h-full w-full ${pathname === href ? 'text-primary' : 'text-muted-foreground'} hover:bg-muted`}>
                            <Icon className="w-6 h-6 mb-1"/>
                            <span className="text-xs">{label}</span>
                        </button>
                    </Link>
                ))}
            </div>
        </div>
    )
}


export function AppSidebar() {
  const isMobile = useIsMobile();
  return (
    <>
       <div className="hidden md:block">
            <SidebarProvider>
                <Sidebar>
                    <AppSidebarContent />
                </Sidebar>
            </SidebarProvider>
       </div>
       {isMobile && <BottomNavBar/>}
    </>
  );
}
