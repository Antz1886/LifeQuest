
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Archive, Calendar, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUser } from '@/context/user-context';

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/project-vault", label: "Projects", icon: Archive },
];

function Sidebar() {
    const pathname = usePathname();
    return (
        <aside className="hidden lg:flex flex-col w-72 bg-card border-r border-border h-screen sticky top-0 transition-all duration-300">
            <div className="flex-1 py-10 px-6 space-y-3">
                <div className="mb-10 px-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <LayoutGrid className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-headline font-bold tracking-tight">LifeQuest</span>
                    </div>
                </div>
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = (href === "/" && pathname === href) || (href !== "/" && pathname && pathname.startsWith(href));
                    return (
                        <Link href={href} key={label} passHref>
                            <button className={cn(
                                'flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-200 group relative',
                                isActive 
                                    ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/30' 
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}>
                                <Icon className={cn("w-5 h-5", isActive ? "" : "group-hover:scale-110 transition-transform")} />
                                <span className="font-semibold tracking-wide">{label}</span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="sidebar-active"
                                        className="absolute right-2 w-1.5 h-6 bg-primary-foreground/50 rounded-full"
                                    />
                                )}
                            </button>
                        </Link>
                    );
                })}
            </div>
            <div className="p-6 border-t border-border/50">
                <div className="bg-muted/50 rounded-2xl p-6 text-center border border-border/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Status</p>
                    <p className="text-sm font-bold text-primary italic">"Master of Wisdom"</p>
                </div>
            </div>
        </aside>
    );
}

function BottomNavBar() {
    const pathname = usePathname();
    return (
        <div className="lg:hidden fixed z-50 transition-all duration-300 portrait:bottom-4 portrait:left-1/2 portrait:-translate-x-1/2 portrait:w-[90%] portrait:max-w-md portrait:h-16 portrait:rounded-[2rem] landscape:bottom-0 landscape:left-0 landscape:right-0 landscape:w-full landscape:h-12 landscape:rounded-none landscape:border-x-0 landscape:border-b-0 landscape:border-t bg-card/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden pb-safe">
            <div className="grid h-full grid-cols-3 font-medium">
                {navItems.map(({href, label, icon: Icon}) => {
                    const isActive = (href === "/" && pathname === href) || (href !== "/" && pathname && pathname.startsWith(href));
                    return (
                        <Link href={href} key={label} passHref>
                            <button type="button" className={cn(
                                'inline-flex flex-col items-center justify-center h-full w-full transition-all relative',
                                isActive ? 'text-primary' : 'text-muted-foreground/60'
                            )}>
                                <Icon className={cn(
                                    "transition-transform duration-300", 
                                    isActive && "scale-110",
                                    "portrait:w-6 portrait:h-6 portrait:mb-0.5",
                                    "landscape:w-5 landscape:h-5"
                                )} />
                                <span className={cn(
                                    "text-[9px] font-bold tracking-wider uppercase transition-all landscape:hidden", 
                                    isActive ? "opacity-100" : "opacity-50"
                                )}>
                                    {label}
                                </span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="nav-active"
                                        className="absolute bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.8)] portrait:bottom-1.5 portrait:w-1 portrait:h-1 landscape:bottom-1 landscape:w-1.5 landscape:h-1.5"
                                    />
                                )}
                            </button>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const { cloudSyncError } = useUser();

    return (
        <div className="flex min-h-screen w-full bg-background selection:bg-primary/20 antialiased overflow-x-hidden relative">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] aspect-square rounded-full bg-primary/10 blur-[120px] transition-colors duration-500" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] aspect-square rounded-full bg-accent/5 blur-[100px] transition-colors duration-500" />
                {/* Dynamic Subtle Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="flex w-full z-10 relative">
                <Sidebar />
                <div className="flex flex-col flex-1 min-w-0 portrait:pb-24 landscape:pb-16 lg:pb-0">
                    {cloudSyncError && (
                        <div className="bg-red-500/10 border-b border-red-500/20 text-red-200 px-4 py-3 text-xs sm:text-sm font-medium flex items-center justify-between gap-4 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 animate-pulse" />
                                <span>
                                    <strong>Database Sync Offline:</strong> Firestore Security Rules rejected your database writes. Data is safely saved locally on this browser. Copy the rules in <code className="bg-red-500/20 px-1.5 py-0.5 rounded font-mono text-white">firestore.rules</code> to your Firebase console to enable cross-device cloud sync.
                                </span>
                            </div>
                        </div>
                    )}
                    {children}
                </div>
            </div>
            <BottomNavBar />
        </div>
    )
}
