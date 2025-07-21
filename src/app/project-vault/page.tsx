
"use client";

import { UserProvider } from "@/context/user-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, PlusCircle } from "lucide-react";

export default function ProjectVaultPage() {
  return (
    <UserProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex items-center justify-between p-4 border-b">
               <SidebarTrigger className="md:hidden"/>
               <h1 className="text-2xl font-headline font-semibold">Project Vault</h1>
            </header>
            <main className="p-4 lg:p-6 space-y-6">
               <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                            <Archive className="text-primary"/>
                            Your Projects
                        </CardTitle>
                        <CardDescription>
                            Manage your long-term projects and goals here.
                        </CardDescription>
                    </div>
                     <Button disabled>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add New Project
                    </Button>
                </CardHeader>
                <CardContent>
                   <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg">
                        <Archive className="w-16 h-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-xl font-semibold text-muted-foreground">Your Project Vault is Empty</h3>
                        <p className="text-muted-foreground mt-2">Add your first project to get started!</p>
                   </div>
                </CardContent>
               </Card>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}
