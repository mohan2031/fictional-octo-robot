"use client";

import { useState, useEffect } from 'react';
import type { Shop } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, LocateFixed, Dices } from 'lucide-react';
import { ShopCard } from '@/components/shop-card';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShopSearchProps {
  shops: Shop[];
}

const ShopMap = dynamic(() => import('@/components/shop-map').then(mod => mod.ShopMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted flex items-center justify-center"><p>Loading map...</p></div>
});

// Haversine distance formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    if ((lat1 === lat2) && (lon1 === lon2)) {
		return 0;
	}
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

const shopCategoriesList: Shop['category'][] = ['Grocery', 'Electronics', 'Plumbing', 'Electrician', 'Other'];
const displayCategories = ['All', ...shopCategoriesList];


export function ShopSearch({ shops }: ShopSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();


  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setSortBy('distance');
                toast({ title: "Location found!", description: "Sorting shops by distance." });
                setIsLocating(false);
            },
            (error) => {
                console.error("Error getting user location", error);
                toast({ variant: "destructive", title: "Location Error", description: "Could not get your location. Please enable location services." });
                setIsLocating(false);
            }
        );
    } else {
        toast({ variant: "destructive", title: "Location Error", description: "Geolocation is not supported by your browser." });
        setIsLocating(false);
    }
  };

  const handleRandomVillage = () => {
    if (shops.length === 0) return;

    const locations = [...new Set(shops.map(s => s.location))].filter(Boolean);
    if (locations.length === 0) {
        toast({ variant: "destructive", title: "No Locations", description: "No shops have a location set." });
        return;
    }
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    setSearchTerm(randomLocation);
    toast({ title: `Welcome to ${randomLocation}!`, description: "Showing shops from a random village." });
  };

  let processedShops = shops.map(shop => {
      const distance = userLocation ? getDistance(userLocation.lat, userLocation.lng, shop.lat, shop.lng) : null;
      return { ...shop, distance };
  });
  
  processedShops = processedShops.filter(shop => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      shop.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      shop.description.toLowerCase().includes(lowerCaseSearchTerm) ||
      shop.location.toLowerCase().includes(lowerCaseSearchTerm);
    
    const matchesCategory =
      category === 'All' || shop.category === category;
      
    return matchesSearch && matchesCategory;
  });

  if (sortBy === 'distance' && userLocation) {
      processedShops.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
      });
  }
  const filteredAndSortedShops = processedShops;

  return (
    <>
      <div className="mb-8 p-4 bg-card rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, service, or village..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isClient ? (
            <>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                    {displayCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                        {cat === 'All' ? 'All Categories' : cat}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleLocateMe} disabled={isLocating}>
                    <LocateFixed className={`mr-2 h-4 w-4 ${isLocating ? 'animate-pulse' : ''}`} />
                    {isLocating ? 'Locating...' : 'Find Nearby'}
                </Button>
                 <Button onClick={handleRandomVillage} variant="outline">
                    <Dices className="mr-2 h-4 w-4" />
                    Random Village
                </Button>
            </>
          ) : (
            <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:h-[70vh] rounded-lg overflow-hidden border">
           <ShopMap shops={filteredAndSortedShops} />
        </div>
        <div className="lg:h-[70vh] overflow-y-auto pr-4 -mr-4">
          {filteredAndSortedShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              {filteredAndSortedShops.map((shop) => (
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
