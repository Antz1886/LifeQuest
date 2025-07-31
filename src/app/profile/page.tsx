
"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { UserProfileCard } from "@/components/profile/user-profile-card";
import { ProfileCustomizer } from "@/components/profile/profile-customizer";

export default function ProfilePage() {
  return (
      <AppShell>
            <AppHeader title="Your Profile" />
            <main className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <UserProfileCard />
                </div>
                <div className="lg:col-span-2">
                    <ProfileCustomizer />
                </div>
            </main>
      </AppShell>
  )
}
