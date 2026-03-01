import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-card border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
            <Leaf className="h-6 w-6" />
            <span>RuralReach</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" asChild>
              <Link href="/">Browse Shops</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Shop Owner Portal</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
