"use client";

import { useMemo, useState } from 'react';
import { collection, query, where, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import type { Appointment, Clinic } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2, Check, X, Circle } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


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


export function AppointmentList() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const clinicsQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, "clinics"),
            where("ownerId", "==", user.uid)
        );
    }, [firestore, user]);

    const { data: clinics, loading: clinicsLoading } = useCollection(clinicsQuery);
    
    const clinic = clinics?.[0] as Clinic | undefined;
    const clinicId = clinic?.id;

    const appointmentsQuery = useMemo(() => {
        if (!firestore || !clinicId) return null;
        return query(
            collection(firestore, 'appointments'),
            where('clinicId', '==', clinicId),
            orderBy('appointmentDate', 'desc')
        );
    }, [firestore, clinicId]);

    const { data: appointments, loading: appointmentsLoading } = useCollection(appointmentsQuery);
    
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

    const handleStatusChange = async (appointmentId: string, status: Appointment['status']) => {
        if (!firestore) return;

        const appointmentRef = doc(firestore, 'appointments', appointmentId);
        try {
            updateDoc(appointmentRef, { status: status })
                .catch((error) => {
                    const permissionError = new FirestorePermissionError({
                        path: appointmentRef.path,
                        operation: 'update',
                        requestResourceData: { status },
                    });
                    errorEmitter.emit('permission-error', permissionError);
                    throw error;
                });
            toast({
                title: "Status Updated",
                description: `Appointment status changed to ${status}.`,
            });
        } catch (error: any) {
             if (!(error instanceof FirestorePermissionError)) {
                toast({
                    title: "Error Updating Status",
                    description: error.message || "Could not update the appointment.",
                    variant: "destructive",
                });
             }
        }
    };


    if (clinicsLoading || appointmentsLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4">Loading appointments...</p>
            </div>
        );
    }
    
    if (!clinic) {
        return <p className="text-center text-muted-foreground py-8">You haven't set up a clinic yet.</p>;
    }

    if (processedAppointments.length === 0) {
        return <p className="text-center text-muted-foreground py-8">You have no appointments yet.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {processedAppointments.map((appt) => (
                    <TableRow key={appt.id}>
                        <TableCell className="font-medium">{appt.patientName}</TableCell>
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
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Appointment Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={() => handleStatusChange(appt.id, 'completed')}>Mark as Completed</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleStatusChange(appt.id, 'scheduled')}>Mark as Scheduled</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleStatusChange(appt.id, 'cancelled')} className="text-destructive">Mark as Cancelled</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
