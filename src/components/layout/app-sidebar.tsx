
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
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 p-2">
            <Flame className="w-8 h-8 text-primary" />
            <span className="text-2xl font-headline font-semibold">LifeQuest</span>
        </Link>
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
          <SidebarMenuButton tooltip="Progress">
            <BarChart3 />
            <span>Progress Log</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Project Vault">
            <Archive />
            <span>Project Vault</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Zen Zone">
            <BrainCircuit />
            <span>Zen Zone</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarFooter>
         <SidebarMenuItem>
          <SidebarMenuButton tooltip="Profile">
            <User />
            <span>Profile</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Settings">
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
