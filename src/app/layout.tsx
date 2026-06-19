
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/user-context";
import { AuthProvider, AuthGate } from "@/context/auth-context";
import { Inter, Space_Grotesk } from 'next/font/google';
import { PwaRegister } from "@/components/pwa-register";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'sans-serif'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  fallback: ['system-ui', 'sans-serif'],
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "LifeQuest | OS for the Self",
  description: "Gamified Productivity & Balance for a High-Performer",
  manifest: "/manifest.json",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 1. Capture resource loading errors (stylesheets and scripts)
                window.addEventListener('error', function(event) {
                  var target = event.target;
                  if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
                    var src = target.src || target.href;
                    if (src && (src.indexOf('/_next/static/') !== -1 || src.indexOf('.js') !== -1 || src.indexOf('.css') !== -1)) {
                      console.warn('Static chunk failed to load:', src, '. Forcing reload...');
                      window.location.reload();
                    }
                  }
                }, true);

                // 2. Capture promise rejections (ChunkLoadErrors from dynamic imports)
                window.addEventListener('unhandledrejection', function(event) {
                  var reason = event.reason;
                  var isChunkError = reason && (
                    reason.name === 'ChunkLoadError' || 
                    (reason.message && /loading.*chunk/i.test(reason.message))
                  );
                  if (isChunkError) {
                    console.warn('Dynamic chunk load failed. Forcing reload...');
                    window.location.reload();
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <AuthProvider>
            <AuthGate>
                <UserProvider>
                    {children}
                    <Toaster />
                    <PwaRegister />
                </UserProvider>
            </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
