"use client";

import { useMemo } from 'react';
import { collection, query, where, DocumentData } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import type { Shop } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditShopForm } from '@/components/edit-shop-form';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
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

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-left">
                <h2 className="text-3xl font-bold font-headline">Shop Settings</h2>
                <p className="text-muted-foreground">Manage your shop details and preferences.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Shop Profile</CardTitle>
                    <CardDescription>Update your public-facing shop information.</CardDescription>
                </CardHeader>
                <CardContent>
                    {shopsLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-4">Loading shop settings...</p>
                        </div>
                    ) : shop ? (
                        <EditShopForm shop={shop} />
                    ) : (
                        <p className="text-muted-foreground text-center">You haven't set up a shop yet. Please sign up to create one.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
