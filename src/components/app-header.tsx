"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Stethoscope, LogOut, ShoppingCart, Briefcase } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export function AppHeader() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/');
    } catch (error) {
      toast({
        title: 'Error Signing Out',
        description: 'There was a problem signing out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="bg-card border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
            <Briefcase className="h-6 w-6" />
            <span>LocalLink</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" asChild>
              <Link href="/">Find a Clinic</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/shops">Find a Shop</Link>
            </Button>
            {!loading && (
              user ? (
                <>
                  <Button asChild>
                    <Link href="/dashboard">Clinic Dashboard</Link>
                  </Button>
                   <Button asChild>
                    <Link href="/shop-dashboard">Shop Dashboard</Link>
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleSignOut} title="Sign Out">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                   <Button asChild>
                    <Link href="/signup-shop">Register Shop</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Register Clinic</Link>
                  </Button>
                </>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
