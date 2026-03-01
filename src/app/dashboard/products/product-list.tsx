"use client";

import { useMemo } from 'react';
import { collection, query, where, DocumentData } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import type { Shop, Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FilePenLine } from "lucide-react";
import { Loader2 } from 'lucide-react';

export function ProductList() {
    const firestore = useFirestore();
    const { user } = useUser();

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
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <FilePenLine className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
    );
}
