
"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Flame, User } from 'lucide-react';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (user) {
    router.push('/');
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
        <div className="flex items-center gap-4 mb-8">
             <Flame className="w-16 h-16 text-primary" />
             <h1 className="text-6xl font-headline font-bold text-foreground">
                LifeQuest
             </h1>
        </div>
        <div className="w-full max-w-sm text-center">
            <p className="text-muted-foreground mb-8 text-lg">
                Gamify your life. Achieve your goals.
            </p>
            <Button onClick={signInWithGoogle} size="lg" className="w-full text-lg py-6">
                 <User className="mr-2"/>
                 Sign in with Google
            </Button>
        </div>
    </div>
  );
}
