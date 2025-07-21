
"use client";

import { UserProvider } from "@/context/user-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CheckCircle, Award } from "lucide-react";
import { useUser } from "@/context/user-context";
import { Badge } from "@/components/ui/badge";

function ProgressLogContent() {
    const { quests, profile } = useUser();
    const completedQuests = quests.filter(q => q.isCompleted).slice(-10).reverse(); // Show last 10 completed

    return (
        <main className="p-4 lg:p-6 space-y-6">
            <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <BarChart3 className="text-primary"/>
                    Your Achievements
                </CardTitle>
                <CardDescription>
                    A log of your accomplishments and completed quests.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-card/50">
                        <CardHeader className="flex-row items-center gap-4 space-y-0">
                            <Award className="w-8 h-8 text-accent"/>
                            <div>
                                <CardTitle className="text-lg font-bold">{profile.level}</CardTitle>
                                <CardDescription>Current Level</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                    <Card className="bg-card/50">
                            <CardHeader className="flex-row items-center gap-4 space-y-0">
                            <CheckCircle className="w-8 h-8 text-accent"/>
                            <div>
                                <CardTitle className="text-lg font-bold">{quests.filter(q=>q.isCompleted).length}</CardTitle>
                                <CardDescription>Quests Completed</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                        <Card className="bg-card/50">
                            <CardHeader className="flex-row items-center gap-4 space-y-0">
                            <Award className="w-8 h-8 text-accent"/>
                            <div>
                                <CardTitle className="text-lg font-bold">{profile.xp}</CardTitle>
                                <CardDescription>Total XP Gained</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </div>
                    <div>
                    <h3 className="text-xl font-headline mb-4">Recently Completed Quests</h3>
                    <div className="space-y-3">
                        {completedQuests.length > 0 ? completedQuests.map(quest => (
                            <div key={quest.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <p className="font-medium">{quest.title}</p>
                                <Badge variant="secondary">+{quest.xp} XP</Badge>
                            </div>
                        )) : (
                            <p className="text-muted-foreground text-center py-4">No quests completed recently.</p>
                        )}
                    </div>
                </div>
            </CardContent>
            </Card>
        </main>
    )
}

function ProgressLogPageLayout() {
  return (
     <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex items-center justify-between p-4 border-b">
               <SidebarTrigger className="md:hidden"/>
               <h1 className="text-2xl font-headline font-semibold">Progress Log</h1>
            </header>
            <ProgressLogContent />
          </SidebarInset>
        </div>
      </SidebarProvider>
  )
}

export default function ProgressLogPage() {
  return (
    <UserProvider>
      <ProgressLogPageLayout />
    </UserProvider>
  );
}
