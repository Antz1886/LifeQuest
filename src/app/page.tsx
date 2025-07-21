
"use client";

import { UserProvider } from "@/context/user-context";
import { useAuth } from "@/context/auth-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserStats } from "@/components/dashboard/user-stats";
import { QuestBoard } from "@/components/dashboard/quest-board";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedHome() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="flex justify-center items-center h-screen bg-background">Loading...</div>;
  }

  return (
    <UserProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex items-center justify-between p-4 border-b">
               <SidebarTrigger className="md:hidden"/>
               <h1 className="text-2xl font-headline font-semibold">Daily Mission Dashboard</h1>
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
