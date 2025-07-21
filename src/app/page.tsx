
"use client";

import { UserProvider } from "@/context/user-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserStats } from "@/components/dashboard/user-stats";
import { QuestBoard } from "@/components/dashboard/quest-board";
import { FocusMode } from "@/components/dashboard/focus-mode";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

function DashboardContent() {
  return (
    <UserProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex items-center justify-between p-4 border-b">
               <SidebarTrigger className="md:hidden"/>
               <h1 className="text-2xl font-headline font-semibold">Daily Mission Dashboard</h1>
               <FocusMode>
                 <Button variant="outline" className="gap-2">
                   <Target className="w-4 h-4" />
                   Focus Mode
                 </Button>
               </FocusMode>
            </header>
            <main className="p-4 lg:p-6 space-y-6">
              <UserStats />
              <QuestBoard />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </UserProvider>
  )
}


export default function Home() {
  return <DashboardContent/>
}
