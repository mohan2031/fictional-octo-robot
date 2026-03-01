"use client";

import { useMemo } from 'react';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import type { Inquiry } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AiInquiryResponse } from '@/components/ai-inquiry-response';

// A type guard to check if a value is a Timestamp
function isTimestamp(value: any): value is Timestamp {
    return value && typeof value.toDate === 'function';
}

export function InquiryList() {
    const firestore = useFirestore();
    const shopId = '1'; // Hardcoded for now

    const inquiriesQuery = useMemo(() => {
        if (!firestore || !shopId) return null;
        return query(
            collection(firestore, "inquiries"),
            where("shopId", "==", shopId),
            orderBy("createdAt", "desc")
        );
    }, [firestore, shopId]);

    const { data: inquiries, loading } = useCollection(inquiriesQuery);

    if (loading) {
        return <p>Loading inquiries...</p>;
    }

    if (!inquiries || inquiries.length === 0) {
        return <p>You have no inquiries yet.</p>;
    }
    
    const processedInquiries = inquiries.map(inquiry => {
        const inquiryData = inquiry as any;
        return {
            ...inquiryData,
            createdAt: isTimestamp(inquiryData.createdAt) 
                ? inquiryData.createdAt.toDate()
                : new Date(),
        } as Inquiry;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());


    return (
        <Accordion type="single" collapsible className="w-full">
            {processedInquiries.map((inquiry) => (
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
                       <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
                            <p><strong>From:</strong> {inquiry.name} ({inquiry.contact})</p>
                            <p>{inquiry.message}</p>
                            <div className="not-prose">
                                <AiInquiryResponse inquiry={inquiry} />
                            </div>
                       </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}
