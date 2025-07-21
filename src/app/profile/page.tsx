
"use client";

import { UserProvider } from "@/context/user-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserProfileCard } from "@/components/profile/user-profile-card";
import { ProfileCustomizer } from "@/components/profile/profile-customizer";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function ProfileContent() {
    return (
      <UserProvider>
        <SidebarProvider>
            <div className="flex min-h-screen">
            <AppSidebar />
            <SidebarInset className="flex-1">
                <header className="flex items-center justify-between p-4 border-b">
                <SidebarTrigger className="md:hidden"/>
                <h1 className="text-2xl font-headline font-semibold">Your Profile</h1>
                </header>
                <main className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <UserProfileCard />
                    </div>
                    <div className="lg:col-span-2">
                        <ProfileCustomizer />
                    </div>
                </main>
            </SidebarInset>
            </div>
        </SidebarProvider>
      </UserProvider>
    )
}

export default function ProfilePage() {
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

  return <ProfileContent />;
}
