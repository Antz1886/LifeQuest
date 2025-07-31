
"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Map } from "lucide-react";

export default function WeeklyMapPage() {
  return (
      <AppShell>
        <AppHeader title="Weekly Map" />
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
      </AppShell>
  );
}
