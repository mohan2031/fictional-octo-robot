
"use client";

import { useMemo, useState } from 'react';
import { collection, query, where, DocumentData, doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import type { Shop, Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { MoreHorizontal, FilePenLine, Trash2, Loader2 } from "lucide-react";
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function ProductList() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const shopsQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, "shops"),
            where("ownerId", "==", user.uid)
        );
    }, [firestore, user]);

    const { data: shops, loading: shopsLoading } = useCollection(shopsQuery);
    
    const shop = shops?.[0] as DocumentData as Shop | undefined;
    const products = shop?.products || [];

    const handleDeleteProduct = async () => {
        if (!firestore || !shop || !productToDelete) return;
        
        setIsDeleting(true);

        const shopRef = doc(firestore, 'shops', shop.id);
        
        // Find the exact product object from the current state to ensure `arrayRemove` works
        const productObjectInArray = shop.products.find(p => p.id === productToDelete.id);
        
        if (!productObjectInArray) {
            toast({ title: "Error", description: "Product not found for deletion.", variant: "destructive" });
            setIsDeleting(false);
            setProductToDelete(null);
            return;
        }

        try {
            updateDoc(shopRef, {
                products: arrayRemove(productObjectInArray)
            }).catch((error) => {
              const permissionError = new FirestorePermissionError({
                  path: shopRef.path,
                  operation: 'update',
                  requestResourceData: { products: arrayRemove(productObjectInArray) },
              });
              errorEmitter.emit('permission-error', permissionError);
              throw error;
            });
            
            toast({
                title: "Product Deleted",
                description: `${productToDelete.name} has been removed from your shop.`,
            });
        } catch (error: any) {
             console.error("Error deleting product:", error);
             if (!(error instanceof FirestorePermissionError)) {
                toast({
                    title: "Error Deleting Product",
                    description: error.message || "Could not remove the product.",
                    variant: "destructive",
                });
             }
        } finally {
            setIsDeleting(false);
            setProductToDelete(null);
        }
    };


    if (shopsLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4">Loading products...</p>
            </div>
        );
    }
    
    if (!shop) {
        return <p className="text-center text-muted-foreground py-8">You haven't set up a shop yet.</p>;
    }

    if (products.length === 0) {
        return <p className="text-center text-muted-foreground py-8">You have no products yet. Click "Add Product" to get started.</p>;
    }

    return (
        <>
         <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant={product.isAvailable ? "secondary" : "outline"}>
                      {product.isAvailable ? "Available" : "Out of stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Product Actions for {product.name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                           <Link href={`/dashboard/products/edit/${product.id}`}>
                                <FilePenLine className="mr-2 h-4 w-4" />
                                Edit
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive" 
                            onSelect={() => setProductToDelete(product)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <AlertDialog open={!!productToDelete} onOpenChange={(isOpen) => !isOpen && setProductToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the product 
                        <span className="font-semibold"> &quot;{productToDelete?.name}&quot; </span> 
                        from your shop.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteProduct}
                        disabled={isDeleting}
                        className={buttonVariants({ variant: "destructive" })}
                    >
                         {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                         {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
    );
}

