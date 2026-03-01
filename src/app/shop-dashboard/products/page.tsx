'use client';

import { useMemo, useState } from 'react';
import { collection, query, where, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import type { Shop, Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { v4 as uuidv4 } from 'uuid';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const productSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  isAvailable: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      isAvailable: true,
    },
  });

  const shopsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'shops'), where('ownerId', '==', user.uid));
  }, [firestore, user]);

  const { data: shops, loading: shopsLoading } = useCollection(shopsQuery);
  const shop = shops?.[0] as Shop | undefined;

  const handleGenerateDescription = async () => {
    const productName = form.getValues('name');
    if (!productName) {
      toast({
        title: 'Product Name Required',
        description: 'Please enter a product name to generate a description.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateProductDescription({ productName });
      form.setValue('description', result.description);
      toast({ title: 'Description Generated!', description: 'The AI has written a description for you.' });
    } catch (error) {
      console.error('Failed to generate description:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate a description at this time.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!firestore || !shop) {
        toast({ title: 'Error', description: 'Shop not found.', variant: 'destructive' });
        return;
    }
    setIsSubmitting(true);
    try {
        const newProduct: Product = {
            ...data,
            id: uuidv4(),
            imageUrl: 'https://picsum.photos/seed/product/400/300',
            imageHint: 'product',
        };

        const shopRef = doc(firestore, 'shops', shop.id);
        
        updateDoc(shopRef, {
            products: arrayUnion(newProduct)
        }).catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: shopRef.path,
                operation: 'update',
                requestResourceData: { products: [newProduct] },
            });
            errorEmitter.emit('permission-error', permissionError);
            throw error;
        });

        toast({
            title: 'Product Added!',
            description: `${data.name} has been added to your shop.`,
        });
        form.reset();
        setIsDialogOpen(false);
    } catch (error: any) {
         if (!(error instanceof FirestorePermissionError)) {
            toast({
              title: "Error Adding Product",
              description: error.message || "An unexpected error occurred.",
              variant: "destructive",
            });
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  if (shopsLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!shop) {
    return <p>You have not created a shop yet.</p>;
  }

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <div>
            <h2 className="text-3xl font-bold font-headline">Manage Products</h2>
            <p className="text-muted-foreground">Add, edit, or remove products from your shop.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Product
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Add a New Product</DialogTitle>
                    <DialogDescription>
                        Fill in the details for your new product. Click "Save product" when you're done.
                    </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input id="name" {...form.register('name')} />
                            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Product Description</Label>
                            <Textarea id="description" {...form.register('description')} rows={5} />
                             <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Generate with AI
                            </Button>
                            {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Controller
                                control={form.control}
                                name="isAvailable"
                                render={({ field }) => (
                                    <Switch
                                    id="isAvailable"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label htmlFor="isAvailable">Available for sale</Label>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save product
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Product List</CardTitle>
          <CardDescription>A list of all products currently in your shop.</CardDescription>
        </CardHeader>
        <CardContent>
          {shop.products && shop.products.length > 0 ? (
            <div className="space-y-4">
              {shop.products.map(product => (
                <div key={product.id} className="flex items-center gap-4 border p-4 rounded-lg">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                    data-ai-hint={product.imageHint}
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  </div>
                  <Badge variant={product.isAvailable ? 'secondary' : 'outline'}>
                    {product.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" disabled>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">You haven't added any products yet.</p>
              <p className="text-muted-foreground text-sm">Click "Add New Product" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
