
"use client";

import { useMemo } from 'react';
import { collection, query, where, orderBy, doc, getDocs } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import type { Appointment, ShopInquiry } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGuard } from '../dashboard/auth-guard'; // Re-using the same auth guard
import { AppointmentHistory } from './appointment-history';
import { InquiryHistory } from './inquiry-history';


export default function MyAccountPage() {
    const firestore = useFirestore();
    const { user } = useUser();

    const appointmentsQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'appointments'),
            where('userId', '==', user.uid),
            orderBy('appointmentDate', 'desc')
        );
    }, [firestore, user]);

    const { data: appointments, loading: appointmentsLoading } = useCollection(appointmentsQuery);

    const inquiriesQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'shop-inquiries'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, user]);

    const { data: inquiries, loading: inquiriesLoading } = useCollection(inquiriesQuery);


    return (
        <AuthGuard>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="space-y-8 max-w-4xl mx-auto">
                    <div className="text-left">
                        <h2 className="text-3xl font-bold font-headline">My Account</h2>
                        <p className="text-muted-foreground">View your appointments and manage your account.</p>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>My Appointments</CardTitle>
                            <CardDescription>Here is a list of your past and upcoming appointments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <AppointmentHistory 
                                appointments={appointments as Appointment[] | null} 
                                loading={appointmentsLoading}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>My Shop Inquiries</CardTitle>
                            <CardDescription>Here is a list of your recent messages to local shops.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <InquiryHistory 
                                inquiries={inquiries as ShopInquiry[] | null} 
                                loading={inquiriesLoading}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthGuard>
    );
}
