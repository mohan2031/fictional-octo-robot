"use client";

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import type { Shop, Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditProductForm } from '@/components/edit-product-form';
import { Loader2 } from 'lucide-react';

export default function EditProductPage() {
    const params = useParams();
    const productId = params.productId as string;
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

    const shop = shops?.[0] as Shop | undefined;
    const product = useMemo(() => {
        if (!shop || !shop.products) return null;
        return shop.products.find(p => p.id === productId) || null;
    }, [shop, productId]);

    if (shopsLoading) {
        return (
            <div className="flex items-center justify-center p-8 h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4">Loading product details...</p>
            </div>
        );
    }
    
    if (!shop) {
        return <p className="text-center text-muted-foreground py-8">Shop not found.</p>;
    }

    if (!product) {
        return <p className="text-center text-muted-foreground py-8">Product not found.</p>;
    }
    
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-left">
                <h2 className="text-3xl font-bold font-headline">Edit Product</h2>
                <p className="text-muted-foreground">Update the details for your product below.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                    <CardDescription>Make changes to your product or service.</CardDescription>
                </CardHeader>
                <CardContent>
                    <EditProductForm product={product} shopId={shop.id} />
                </CardContent>
            </Card>
        </div>
    );
}
