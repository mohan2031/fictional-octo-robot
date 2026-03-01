import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="p-0 relative h-40 w-full">
        <Image 
          src={product.imageUrl} 
          alt={product.name} 
          fill
          className="object-cover"
          data-ai-hint={product.imageHint}
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-md font-bold">{product.name}</CardTitle>
            <Badge variant={product.isAvailable ? 'secondary' : 'outline'}>
              {product.isAvailable ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
              {product.isAvailable ? 'Available' : 'Out of Stock'}
            </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
      </CardContent>
      <CardFooter className="p-4 bg-secondary/20">
        <Button variant="outline" className="w-full">
          Reserve or Inquire
        </Button>
      </CardFooter>
    </Card>
  );
}
