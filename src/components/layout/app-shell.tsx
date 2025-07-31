
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Archive, Calendar, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

function BottomNavBar() {
    const pathname = usePathname();
    const navItems = [
        { href: "/", label: "Dashboard", icon: LayoutGrid },
        { href: "/calendar", label: "Calendar", icon: Calendar },
        { href: "/project-vault", label: "Projects", icon: Archive },
    ];
    return (
        <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border">
            <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
                {navItems.map(({href, label, icon: Icon}) => {
                    const isActive = (href === "/" && pathname === href) || (href !== "/" && pathname.startsWith(href));
                    return (
                        <Link href={href} key={label} passHref>
                            <button type="button" className={cn(
                                'inline-flex flex-col items-center justify-center px-5 h-full w-full hover:bg-muted',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )}>
                                <Icon className="w-6 h-6 mb-1"/>
                                <span className="text-xs">{label}</span>
                            </button>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full">
            <div className="flex flex-col flex-1 pb-16 md:pb-0">
                {children}
            </div>
            <BottomNavBar />
        </div>
    )
}
