"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Briefcase, ChevronDown, User as UserIcon } from 'lucide-react';
import { useUser, useAuth, useFirestore, useCollection } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const clinicsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'clinics'), where('ownerId', '==', user.uid));
  }, [firestore, user]);
  const { data: ownedClinics, loading: clinicsLoading } = useCollection(clinicsQuery);

  const shopsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'shops'), where('ownerId', '==', user.uid));
  }, [firestore, user]);
  const { data: ownedShops, loading: shopsLoading } = useCollection(shopsQuery);

  const hasClinic = ownedClinics && ownedClinics.length > 0;
  const hasShop = ownedShops && ownedShops.length > 0;
  
  const isLoading = userLoading || clinicsLoading || shopsLoading;
  const isBusinessOwner = hasClinic || hasShop;

  return (
    <header className="bg-card border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
            <Briefcase className="h-6 w-6" />
            <span>{isClient ? 'RuralReach' : 'RuralReach'}</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" asChild>
              <Link href="/">Find a Clinic</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/shops">Find a Shop</Link>
            </Button>
            
            {isLoading && (
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            )}
            
            {!isLoading && (
              user ? (
                <>
                  {isBusinessOwner ? (
                    <>
                      {hasClinic && (
                        <Button asChild>
                          <Link href="/dashboard">Clinic Dashboard</Link>
                        </Button>
                      )}
                      {hasShop && (
                        <Button asChild>
                          <Link href="/shop-dashboard">Shop Dashboard</Link>
                        </Button>
                      )}
                    </>
                  ) : (
                     <Button asChild variant="outline">
                        <Link href="/my-account">
                          <UserIcon className="mr-2 h-4 w-4" />
                          My Account
                        </Link>
                     </Button>
                  )}
                  <Button variant="outline" size="icon" onClick={handleSignOut} title="Sign Out">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      For Business
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/login">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register">Register</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
