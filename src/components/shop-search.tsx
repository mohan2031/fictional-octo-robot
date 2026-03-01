"use client";

import { useState, useMemo } from 'react';
import type { Shop } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { ShopCard } from '@/components/shop-card';
import dynamic from 'next/dynamic';

interface ShopSearchProps {
  shops: Shop[];
}

const ShopMap = dynamic(() => import('@/components/shop-map').then(mod => mod.ShopMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted flex items-center justify-center"><p>Loading map...</p></div>
});


export function ShopSearch({ shops }: ShopSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const allCategories = shops.map(shop => shop.category);
    // Capitalize first letter
    return ['all', ...Array.from(new Set(allCategories))].map(c => c.charAt(0).toUpperCase() + c.slice(1));
  }, [shops]);

  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const matchesSearch =
        shop.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        shop.description.toLowerCase().includes(lowerCaseSearchTerm);
      
      const lowerCaseCategory = category.toLowerCase();
      const matchesCategory =
        lowerCaseCategory === 'all' || shop.category.toLowerCase() === lowerCaseCategory;
        
      return matchesSearch && matchesCategory;
    });
  }, [shops, searchTerm, category]);

  return (
    <>
      <div className="mb-8 p-4 bg-card rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for shops or services..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:h-[70vh] rounded-lg overflow-hidden border">
           <ShopMap shops={filteredShops} />
        </div>
        <div className="lg:h-[70vh] overflow-y-auto pr-4 -mr-4">
          {filteredShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              {filteredShops.map((shop: Shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 h-full flex flex-col justify-center items-center">
                <h2 className="text-2xl font-semibold">No shops found</h2>
                <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
