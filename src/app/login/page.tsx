
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background to-card p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <Flame className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="mt-4 font-headline text-3xl">Welcome to LifeQuest</CardTitle>
            <CardDescription className="mt-2 text-lg">Your gamified journey to a balanced life starts now.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Button onClick={signInWithGoogle} className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>
                <Chrome className="mr-3 h-5 w-5" />
                Sign In with Google
              </>
            )}
          </Button>
           <p className="mt-4 text-center text-xs text-muted-foreground">
            By signing in, you agree to allow LifeQuest to read your Google Calendar events.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
