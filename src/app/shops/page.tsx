'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import { ShopSearch } from '@/components/shop-search';
import { Skeleton } from '@/components/ui/skeleton';
import type { Shop } from '@/lib/types';

export default function ShopsPage() {
  const firestore = useFirestore();

  const shopsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "shops"));
  }, [firestore]);

  const { data: shops, loading: shopsLoading } = useCollection(shopsQuery);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tight lg:text-5xl text-primary">
          Find Local Shops & Services
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover local businesses and services in your area.
        </p>
      </section>

      {shopsLoading || !shops ? (
        <div className="space-y-8">
            <div className="mb-8 p-4 bg-card rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="md:col-span-2">
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-[70vh] w-full rounded-lg" />
                <div className="lg:h-[70vh] overflow-y-auto pr-4 -mr-4 space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
      ) : (
        <ShopSearch shops={shops as Shop[] || []} />
      )}
    </div>
  );
}
