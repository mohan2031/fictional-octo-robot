import Image from "next/image";
import { getShopById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail, MapPin, Phone, CheckCircle, XCircle, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShopInquiryForm } from "@/components/shop-inquiry-form";

export default async function ShopDetailPage({ params }: { params: { id: string } }) {
  const shop = await getShopById(params.id);

  if (!shop) {
    notFound();
  }

  return (
    <>
      <div className="relative h-64 md:h-80 w-full">
        <Image
          src={shop.imageUrl}
          alt={shop.name}
          fill
          className="object-cover"
          data-ai-hint={shop.imageHint}
          priority
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white p-4">
            <h1 className="text-4xl lg:text-6xl font-bold font-headline">{shop.name}</h1>
            <p className="text-lg mt-2">{shop.category}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <CardTitle className="text-2xl font-bold">About {shop.name}</CardTitle>
                  <Badge variant={shop.isOpen ? 'default' : 'destructive'} className="text-base px-4 py-2">
                    {shop.isOpen ? <CheckCircle className="mr-2 h-5 w-5" /> : <XCircle className="mr-2 h-5 w-5" />}
                    {shop.isOpen ? 'Open Now' : 'Closed'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{shop.description}</p>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                Products & Services
              </h2>
              {shop.products && shop.products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shop.products.map(product => (
                    <ProductCard key={product.id} product={product} shopId={shop.id} />
                  ))}
                </div>
              ) : (
                <Card className="text-center p-8">
                  <p className="text-muted-foreground">No products or services listed yet.</p>
                </Card>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-1 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-muted-foreground">{shop.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-1 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold">Hours</h3>
                    <p className="text-muted-foreground">{shop.hours}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 mt-1 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold">Contact</h3>
                    <Button variant="link" asChild className="p-0 h-auto text-base text-muted-foreground hover:text-primary">
                      <a href={`tel:${shop.phone}`}>{shop.phone}</a>
                    </Button>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4" variant="outline">
                      <Mail className="mr-2 h-4 w-4" /> Send a Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send a Message to {shop.name}</DialogTitle>
                      <DialogDescription>
                        Ask about product availability, prices, or anything else.
                      </DialogDescription>
                    </DialogHeader>
                    <ShopInquiryForm shopId={shop.id} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
