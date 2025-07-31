
"use client";

import { AppSidebar } from "./app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 pb-16 md:pb-0">
                {children}
            </div>
        </div>
    )
}
