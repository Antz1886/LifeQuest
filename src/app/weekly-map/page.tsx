
"use client";

import { UserProvider } from "@/context/user-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Map } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WeeklyMapPage() {
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
                <h1 className="text-2xl font-headline font-semibold">Weekly Map</h1>
            </header>
            <main className="p-4 lg:p-6 space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline text-2xl flex items-center gap-2">
                          <Map className="text-primary"/>
                          Weekly Quest Analysis
                      </CardTitle>
                      <CardDescription>
                          A look at your completed quests over the last 7 days.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <WeeklyChart />
                  </CardContent>
              </Card>
            </main>
            </SidebarInset>
        </div>
        </SidebarProvider>
    </UserProvider>
  );
}
