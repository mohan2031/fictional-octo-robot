"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/client';
import type { Inquiry } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function InquiryList() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const shopId = '1'; // Hardcoded for Ganesh Kirana Store

    useEffect(() => {
        if (!shopId) return;

        const q = query(
            collection(db, "inquiries"), 
            where("shopId", "==", shopId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const inquiriesData: Inquiry[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                inquiriesData.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt.toDate(),
                } as Inquiry);
            });
            setInquiries(inquiriesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching inquiries:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [shopId]);

    if (loading) {
        return <p>Loading inquiries...</p>;
    }

    if (inquiries.length === 0) {
        return <p>You have no inquiries yet.</p>;
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            {inquiries.map((inquiry) => (
                <AccordionItem value={inquiry.id} key={inquiry.id}>
                    <AccordionTrigger>
                        <div className="flex justify-between w-full pr-4">
                           <div className="flex items-center gap-4">
                             {!inquiry.isRead && <Badge>New</Badge>}
                             <span className="font-semibold">{inquiry.name}</span>
                           </div>
                           <span className="text-sm text-muted-foreground">{format(inquiry.createdAt, "PPP p")}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                       <div className="prose prose-sm max-w-none text-muted-foreground">
                            <p><strong>From:</strong> {inquiry.name} ({inquiry.contact})</p>
                            <p>{inquiry.message}</p>
                       </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}
