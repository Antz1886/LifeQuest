
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

function WeeklyMapContent() {
  return (
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
  )
}


function WeeklyMapPageLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex items-center justify-between p-4 border-b">
             <SidebarTrigger className="md:hidden"/>
             <h1 className="text-2xl font-headline font-semibold">Weekly Map</h1>
          </header>
          <WeeklyMapContent />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function WeeklyMapPage() {
  return (
    <UserProvider>
      <WeeklyMapPageLayout />
    </UserProvider>
  )
}
