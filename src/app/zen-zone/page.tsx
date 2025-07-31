
"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { MeditationGenerator } from "@/components/zen-zone/meditation-generator";

export default function ZenZonePage() {
  return (
      <AppShell>
        <AppHeader title="Zen Zone" />
        <main className="p-4 lg:p-6">
            <MeditationGenerator />
        </main>
      </AppShell>
  )
}
