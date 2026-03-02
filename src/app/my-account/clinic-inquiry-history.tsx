
"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Inquiry } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle, Mail } from "lucide-react";
import { format } from 'date-fns';
import Link from 'next/link';

interface ClinicInquiryHistoryProps {
    inquiries: Inquiry[] | null;
    loading: boolean;
}

export function ClinicInquiryHistory({ inquiries, loading }: ClinicInquiryHistoryProps) {
    const firestore = useFirestore();
    const [clinics, setClinics] = useState<Map<string, string>>(new Map());
    const [clinicsLoading, setClinicsLoading] = useState(true);

    useEffect(() => {
        const fetchClinicNames = async () => {
            if (!firestore || !inquiries || inquiries.length === 0) {
                setClinicsLoading(false);
                return;
            };

            const clinicIds = [...new Set(inquiries.map(inq => inq.clinicId))];
            
            if (clinicIds.length === 0) {
                setClinicsLoading(false);
                return;
            }

            try {
                const clinicsRef = collection(firestore, 'clinics');
                const q = query(clinicsRef, where('__name__', 'in', clinicIds));
                const querySnapshot = await getDocs(q);
                
                const clinicMap = new Map<string, string>();
                querySnapshot.forEach(doc => {
                    clinicMap.set(doc.id, doc.data().name);
                });
                setClinics(clinicMap);
            } catch (error) {
                console.error("Error fetching clinic details:", error);
            } finally {
                setClinicsLoading(false);
            }
        };

        fetchClinicNames();
    }, [inquiries, firestore]);


    if (loading || clinicsLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4">Loading your inquiries...</p>
            </div>
        );
    }
    
    if (!inquiries || inquiries.length === 0) {
        return <p className="text-center text-muted-foreground py-8">You have not sent any inquiries to clinics yet.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Clinic</TableHead>
                    <TableHead>Date Sent</TableHead>
                    <TableHead>Your Message</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {inquiries.map((inq) => (
                    <TableRow key={inq.id}>
                        <TableCell className="font-medium">
                            <Link href={`/clinics/${inq.clinicId}`} className="hover:underline text-primary">
                                {clinics.get(inq.clinicId) || 'Loading...'}
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
