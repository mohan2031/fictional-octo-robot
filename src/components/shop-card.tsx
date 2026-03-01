import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin } from 'lucide-react';
import type { Shop } from '@/lib/types';

interface ShopCardProps {
  shop: Shop & { distance: number | null };
}

export function ShopCard({ shop }: ShopCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={shop.imageUrl}
            alt={shop.name}
            fill
            className="object-cover"
            data-ai-hint={shop.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg font-bold">{shop.name}</CardTitle>
          <Badge variant={shop.isOpen ? 'default' : 'destructive'}>
            {shop.isOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{shop.category}</p>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{shop.description}</p>
        {shop.distance !== null && (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary mt-2">
            <MapPin className="h-4 w-4" />
            <span>{shop.distance.toFixed(1)} km away</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 bg-secondary/30">
        <Button asChild className="w-full">
          <Link href={`/shops/${shop.id}`}>
            View Shop <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
