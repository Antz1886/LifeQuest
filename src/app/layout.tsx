
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/user-context";
import { AuthProvider, AuthGate } from "@/context/auth-context";
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: "LifeQuest | OS for the Self",
  description: "Gamified Productivity & Balance for a High-Performer",
  manifest: "/manifest.json",
  themeColor: "#09090b",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LifeQuest",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <AuthProvider>
            <AuthGate>
                <UserProvider>
                    {children}
                    <Toaster />
                </UserProvider>
            </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
