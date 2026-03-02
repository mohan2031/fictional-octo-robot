
"use client";

import { useMemo } from 'react';
import { collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import type { Inquiry } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AiInquiryResponse } from '@/components/ai-inquiry-response';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { mapToInquiry } from '@/lib/type-mappers';


export function InquiryList() {
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
    
    // Assuming one clinic per owner for now
    const clinicId = clinics?.[0]?.id;

    const inquiriesQuery = useMemo(() => {
        if (!firestore || !clinicId) return null;
        return query(
            collection(firestore, "inquiries"),
            where("clinicId", "==", clinicId),
            orderBy("createdAt", "desc")
        );
    }, [firestore, clinicId]);

    const { data: inquiryDocs, loading: inquiriesLoading } = useCollection(inquiriesQuery);

    const processedInquiries: Inquiry[] = useMemo(() => {
        if (!inquiryDocs) return [];
        return inquiryDocs.map(mapToInquiry).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [inquiryDocs]);

    const handleInquiryOpen = (inquiryId: string) => {
        if (!firestore || !inquiryId) return;

        const inquiry = processedInquiries.find(i => i.id === inquiryId);
        // Only update if it's currently unread to avoid unnecessary writes
        if (inquiry && !inquiry.isRead) {
            const inquiryRef = doc(firestore, 'inquiries', inquiryId);
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


    if (clinicsLoading || inquiriesLoading) {
        return <p>Loading messages...</p>;
    }
    
    if (!clinics || clinics.length === 0) {
        return <p>You haven't set up a clinic yet.</p>;
    }

    if (!inquiries || inquiries.length === 0) {
        return <p>You have no messages yet.</p>;
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
                                <AiInquiryResponse inquiry={inquiry} />
                            </div>
                       </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}
