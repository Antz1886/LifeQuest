
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

function ProfileContent() {
    return (
        <main className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-1">
             <UserProfileCard />
           </div>
           <div className="lg:col-span-2">
             <ProfileCustomizer />
           </div>
        </main>
    )
}

function ProfilePageLayout() {
  return (
     <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex items-center justify-between p-4 border-b">
               <SidebarTrigger className="md:hidden"/>
               <h1 className="text-2xl font-headline font-semibold">Your Profile</h1>
            </header>
            <ProfileContent />
          </SidebarInset>
        </div>
      </SidebarProvider>
  )
}

export default function ProfilePage() {
  return (
    <UserProvider>
      <ProfilePageLayout />
    </UserProvider>
  );
}
