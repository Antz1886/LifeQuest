
"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { QuestBoard } from "@/components/dashboard/quest-board";
import DashboardHeader from "@/components/dashboard/dashboard-header";

export default function HomePage() {
  return (
      <AppShell>
        <AppHeader title="Dashboard" />
        <main className="p-4 lg:p-6 space-y-6">
          <DashboardHeader />
          <QuestBoard />
        </main>
      </AppShell>
  )
}
