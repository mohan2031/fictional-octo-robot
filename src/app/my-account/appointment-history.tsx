
"use client";

import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, doc, updateDoc, Timestamp, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Appointment, Clinic } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2, Check, X, Circle, CalendarX } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

// A type guard to check if a value is a Timestamp
function isTimestamp(value: any): value is Timestamp {
    return value && typeof value.toDate === 'function';
}

const statusIcons = {
    scheduled: <Circle className="h-4 w-4 text-blue-500" />,
    completed: <Check className="h-4 w-4 text-green-500" />,
    cancelled: <X className="h-4 w-4 text-red-500" />,
};

const statusColors = {
    scheduled: 'secondary',
    completed: 'default',
    cancelled: 'destructive',
} as const;

interface AppointmentHistoryProps {
    appointments: Appointment[] | null;
    loading: boolean;
}

export function AppointmentHistory({ appointments, loading }: AppointmentHistoryProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [clinics, setClinics] = useState<Map<string, string>>(new Map());
    const [clinicsLoading, setClinicsLoading] = useState(true);

    useEffect(() => {
        const fetchClinicNames = async () => {
            if (!firestore || !appointments || appointments.length === 0) {
                setClinicsLoading(false);
                return;
            };

            const clinicIds = [...new Set(appointments.map(appt => appt.clinicId))];
            
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
    }, [appointments, firestore]);

    const processedAppointments = useMemo(() => {
        if (!appointments) return [];
        return appointments.map(appt => {
            const apptData = appt as any;
            return {
                ...apptData,
                appointmentDate: isTimestamp(apptData.appointmentDate) ? apptData.appointmentDate.toDate() : new Date(),
                createdAt: isTimestamp(apptData.createdAt) ? apptData.createdAt.toDate() : new Date(),
            } as Appointment;
        }).sort((a, b) => b.appointmentDate.getTime() - a.appointmentDate.getTime());
    }, [appointments]);

    const handleCancelAppointment = (appointmentId: string) => {
        if (!firestore) return;

        const appointmentRef = doc(firestore, 'appointments', appointmentId);
        const updateData = { status: 'cancelled' };

        updateDoc(appointmentRef, updateData)
            .then(() => {
                toast({
                    title: "Appointment Cancelled",
                    description: `Your appointment has been cancelled.`,
                });
            })
            .catch((serverError) => {
                console.error("Error cancelling appointment:", serverError);
                const permissionError = new FirestorePermissionError({
                    path: appointmentRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };

    if (loading || clinicsLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4">Loading your appointments...</p>
            </div>
        );
    }
    
    if (processedAppointments.length === 0) {
        return <p className="text-center text-muted-foreground py-8">You have no appointments yet.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Clinic</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {processedAppointments.map((appt) => (
                    <TableRow key={appt.id}>
                        <TableCell className="font-medium">
                            <Link href={`/clinics/${appt.clinicId}`} className="hover:underline text-primary">
                                {clinics.get(appt.clinicId) || 'Loading...'}
                            </Link>
                        </TableCell>
                        <TableCell>{format(appt.appointmentDate, "PPP p")}</TableCell>
                        <TableCell className="max-w-xs truncate">{appt.reason}</TableCell>
                        <TableCell>
                             <Badge variant={statusColors[appt.status]}>
                                {statusIcons[appt.status]}
                                <span className="ml-2 capitalize">{appt.status}</span>
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={appt.status !== 'scheduled'}>
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Appointment Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem 
                                        onSelect={() => handleCancelAppointment(appt.id)} 
                                        disabled={appt.status !== 'scheduled'}
                                        className="text-destructive"
                                    >
                                        <CalendarX className="mr-2 h-4 w-4" />
                                        Cancel Appointment
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
