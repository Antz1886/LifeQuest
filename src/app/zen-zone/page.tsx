
"use client";

import { UserProvider } from "@/context/user-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { MeditationGenerator } from "@/components/zen-zone/meditation-generator";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ZenZonePage() {
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
                <h1 className="text-2xl font-headline font-semibold">Zen Zone</h1>
            </header>
            <main className="p-4 lg:p-6">
              <MeditationGenerator />
            </main>
            </SidebarInset>
        </div>
        </SidebarProvider>
    </UserProvider>
  )
}
