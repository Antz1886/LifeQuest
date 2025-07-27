
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
  SidebarTrigger
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
} from "lucide-react";
import { useUser } from '@/context/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export function AppSidebar() {
  const pathname = usePathname();
  const { profile, isLoaded } = useUser();

  const displayName = isLoaded ? profile.name : 'Adventurer';
  const displayAvatar = isLoaded ? profile.avatarUrl : '';

  return (
    <Sidebar>
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
    </Sidebar>
  );
}
