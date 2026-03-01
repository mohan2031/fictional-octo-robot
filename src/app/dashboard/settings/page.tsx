"use client";

import { useMemo } from 'react';
import { collection, query, where, DocumentData } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import type { Clinic } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditClinicForm } from '@/components/edit-clinic-form';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const firestore = useFirestore();
    const { user } = useUser();

    const clinicsQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, "clinics"),
            where("ownerId", "==", user.uid)
        );
    }, [firestore, user]);

    const { data: clinics, loading: clinicsLoading } = useCollection(clinicsQuery);
    
    const clinic = clinics?.[0] as DocumentData as Clinic | undefined;

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-left">
                <h2 className="text-3xl font-bold font-headline">Clinic Settings</h2>
                <p className="text-muted-foreground">Manage your clinic details and preferences.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Clinic Profile</CardTitle>
                    <CardDescription>Update your public-facing clinic information.</CardDescription>
                </CardHeader>
                <CardContent>
                    {clinicsLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-4">Loading clinic settings...</p>
                        </div>
                    ) : clinic ? (
                        <EditClinicForm clinic={clinic} />
                    ) : (
                        <p className="text-muted-foreground text-center">You haven't set up a clinic yet. Please sign up to create one.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
