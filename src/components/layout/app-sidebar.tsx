

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

export function AppSidebar() {
  const pathname = usePathname();

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
          <SidebarMenuButton tooltip="Zen Zone" disabled>
            <BrainCircuit />
            <span>Zen Zone</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarFooter>
         <SidebarMenuItem>
          <SidebarMenuButton tooltip="Profile" disabled>
            <User />
            <span>Profile</span>
          </SidebarMenuButton>
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
