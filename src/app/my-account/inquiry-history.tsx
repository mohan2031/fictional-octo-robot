
"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { ShopInquiry } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle, Mail } from "lucide-react";
import { format } from 'date-fns';
import Link from 'next/link';

interface InquiryHistoryProps {
    inquiries: ShopInquiry[] | null;
    loading: boolean;
}

export function InquiryHistory({ inquiries, loading }: InquiryHistoryProps) {
    const firestore = useFirestore();
    const [shops, setShops] = useState<Map<string, string>>(new Map());
    const [shopsLoading, setShopsLoading] = useState(true);

    useEffect(() => {
        const fetchShopNames = async () => {
            if (!firestore || !inquiries || inquiries.length === 0) {
                setShopsLoading(false);
                return;
            };

            const shopIds = [...new Set(inquiries.map(inq => inq.shopId))];
            
            if (shopIds.length === 0) {
                setShopsLoading(false);
                return;
            }

            try {
                const shopsRef = collection(firestore, 'shops');
                const q = query(shopsRef, where('__name__', 'in', shopIds));
                const querySnapshot = await getDocs(q);
                
                const shopMap = new Map<string, string>();
                querySnapshot.forEach(doc => {
                    shopMap.set(doc.id, doc.data().name);
                });
                setShops(shopMap);
            } catch (error) {
                console.error("Error fetching shop details:", error);
            } finally {
                setShopsLoading(false);
            }
        };

        fetchShopNames();
    }, [inquiries, firestore]);


    if (loading || shopsLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4">Loading your inquiries...</p>
            </div>
        );
    }
    
    if (!inquiries || inquiries.length === 0) {
        return <p className="text-center text-muted-foreground py-8">You have not sent any inquiries yet.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Shop</TableHead>
                    <TableHead>Date Sent</TableHead>
                    <TableHead>Your Message</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {inquiries.map((inq) => (
                    <TableRow key={inq.id}>
                        <TableCell className="font-medium">
                            <Link href={`/shops/${inq.shopId}`} className="hover:underline text-primary">
                                {shops.get(inq.shopId) || 'Loading...'}
                            </Link>
                        </TableCell>
                        <TableCell>{format(inq.createdAt, "PPP")}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">{inq.message}</TableCell>
                        <TableCell className="text-right">
                             <Badge variant={inq.isRead ? 'secondary' : 'default'}>
                                {inq.isRead ? <MessageCircle className="mr-2 h-4 w-4" /> : <Mail className="mr-2 h-4 w-4" />}
                                {inq.isRead ? 'Read' : 'Sent'}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
