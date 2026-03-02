"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Review } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { format } from 'date-fns';
import Link from 'next/link';
import { ReviewStars } from '@/components/review-stars';

interface ReviewHistoryProps {
    reviews: Review[] | null;
    loading: boolean;
}

export function ReviewHistory({ reviews, loading }: ReviewHistoryProps) {
    const firestore = useFirestore();
    const [businesses, setBusinesses] = useState<Map<string, string>>(new Map());
    const [businessesLoading, setBusinessesLoading] = useState(true);

    useEffect(() => {
        const fetchBusinessNames = async () => {
            if (!firestore || !reviews || reviews.length === 0) {
                setBusinessesLoading(false);
                return;
            };

            const clinicIds = reviews.filter(r => r.businessType === 'clinic').map(r => r.businessId);
            const shopIds = reviews.filter(r => r.businessType === 'shop').map(r => r.businessId);
            
            const businessMap = new Map<string, string>();

            try {
                if (clinicIds.length > 0) {
                    const clinicsRef = collection(firestore, 'clinics');
                    const q = query(clinicsRef, where('__name__', 'in', [...new Set(clinicIds)]));
                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach(doc => {
                        businessMap.set(doc.id, doc.data().name);
                    });
                }
                if (shopIds.length > 0) {
                    const shopsRef = collection(firestore, 'shops');
                    const q = query(shopsRef, where('__name__', 'in', [...new Set(shopIds)]));
                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach(doc => {
                        businessMap.set(doc.id, doc.data().name);
                    });
                }
                setBusinesses(businessMap);
            } catch (error) {
                console.error("Error fetching business details:", error);
            } finally {
                setBusinessesLoading(false);
            }
        };

        fetchBusinessNames();
    }, [reviews, firestore]);

    if (loading || businessesLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4">Loading your reviews...</p>
            </div>
        );
    }
    
    if (!reviews || reviews.length === 0) {
        return <p className="text-center text-muted-foreground py-8">You have not submitted any reviews yet.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {reviews.map((review) => (
                    <TableRow key={review.id}>
                        <TableCell className="font-medium">
                            <Link href={`/${review.businessType}s/${review.businessId}`} className="hover:underline text-primary">
                                {businesses.get(review.businessId) || 'Loading...'}
                            </Link>
                        </TableCell>
                        <TableCell>
                            <ReviewStars rating={review.rating} showText={false} />
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">{review.comment}</TableCell>
                        <TableCell className="text-right">{format(review.createdAt, "PPP")}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
