import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Mail, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShopInquiryForm } from "@/components/shop-inquiry-form";

interface ProductCardProps {
  product: Product;
  shopId: string;
}

export function ProductCard({ product, shopId }: ProductCardProps) {
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
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Mail className="mr-2 h-4 w-4"/>
              Inquire about this
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send an Inquiry</DialogTitle>
              <DialogDescription>
                Ask about availability, price, or other details for the product: <strong>{product.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <ShopInquiryForm 
              shopId={shopId} 
              defaultMessage={`I'm writing to inquire about the product: ${product.name}`} 
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
