
"use client";

import { useMemo } from 'react';
import { collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import type { ShopInquiry } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Loader2 } from 'lucide-react';
import { AiShopInquiryResponse } from '@/components/ai-shop-inquiry-response';
import { mapToShopInquiry } from '@/lib/type-mappers';

export function InquiryList() {
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
    
    // Assuming one shop per owner for now
    const shopId = shops?.[0]?.id;

    const inquiriesQuery = useMemo(() => {
        if (!firestore || !shopId) return null;
        return query(
            collection(firestore, "shop-inquiries"),
            where("shopId", "==", shopId),
            orderBy("createdAt", "desc")
        );
    }, [firestore, shopId]);

    const { data: inquiryDocs, loading: inquiriesLoading } = useCollection(inquiriesQuery);

    const processedInquiries: ShopInquiry[] = useMemo(() => {
        if (!inquiryDocs) return [];
        return inquiryDocs.map(mapToShopInquiry).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [inquiryDocs]);

    const handleInquiryOpen = (inquiryId: string) => {
        if (!firestore || !inquiryId) return;

        const inquiry = processedInquiries.find(i => i.id === inquiryId);
        // Only update if it's currently unread to avoid unnecessary writes
        if (inquiry && !inquiry.isRead) {
            const inquiryRef = doc(firestore, 'shop-inquiries', inquiryId);
            updateDoc(inquiryRef, { isRead: true })
                .catch(() => {
                    const permissionError = new FirestorePermissionError({
                        path: inquiryRef.path,
                        operation: 'update',
                        requestResourceData: { isRead: true },
                    });
                    errorEmitter.emit('permission-error', permissionError);
                });
        }
    };


    if (shopsLoading || inquiriesLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4">Loading messages...</p>
            </div>
        );
    }
    
    if (!shops || shops.length === 0) {
        return <p className="text-center text-muted-foreground py-8">You haven't set up a shop yet.</p>;
    }

    if (!inquiries || inquiries.length === 0) {
        return <p className="text-center text-muted-foreground py-8">You have no messages yet.</p>;
    }
    

    return (
        <Accordion type="single" collapsible className="w-full" onValueChange={handleInquiryOpen}>
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
                                <AiShopInquiryResponse inquiry={inquiry} />
                            </div>
                       </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}
