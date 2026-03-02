
"use client";

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import type { Clinic, Inquiry, Appointment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, Inbox, MessageSquareWarning } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { subDays, format, startOfDay, isSameDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { mapToClinic, mapToInquiry, mapToAppointment } from '@/lib/type-mappers';


function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}


export function DashboardStats() {
    const firestore = useFirestore();
    const { user } = useUser();

    const clinicsQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, "clinics"),
            where("ownerId", "==", user.uid)
        );
    }, [firestore, user]);

    const { data: clinicDocs, loading: clinicsLoading } = useCollection(clinicsQuery);
    
    const clinic: Clinic | undefined = useMemo(() => {
        return clinicDocs && clinicDocs.length > 0 ? mapToClinic(clinicDocs[0]) : undefined;
    }, [clinicDocs]);
    const clinicId = clinic?.id;

    const inquiriesQuery = useMemo(() => {
        if (!firestore || !clinicId) return null;
        return query(
            collection(firestore, "inquiries"),
            where("clinicId", "==", clinicId)
        );
    }, [firestore, clinicId]);

    const { data: inquiryDocs, loading: inquiriesLoading } = useCollection(inquiriesQuery);

    const appointmentsQuery = useMemo(() => {
        if (!firestore || !clinicId) return null;
        return query(
            collection(firestore, "appointments"),
            where("clinicId", "==", clinicId)
        );
    }, [firestore, clinicId]);

    const { data: appointmentDocs, loading: appointmentsLoading } = useCollection(appointmentsQuery);

    const processedInquiries: Inquiry[] = useMemo(() => {
        if (!inquiryDocs) return [];
        return inquiryDocs.map(mapToInquiry);
    }, [inquiryDocs]);
    
    const processedAppointments: Appointment[] = useMemo(() => {
        if (!appointmentDocs) return [];
        return appointmentDocs.map(mapToAppointment);
    }, [appointmentDocs]);

    const inquiryStats = useMemo(() => {
        const totalInquiries = processedInquiries.length;
        const unreadInquiries = processedInquiries.filter(inq => !inq.isRead).length;

        const today = startOfDay(new Date());
        const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse();

        const chartData = last7Days.map(day => ({
            date: format(day, 'MMM d'),
            inquiries: processedInquiries.filter(inq => isSameDay(inq.createdAt, day)).length,
        }));

        return { totalInquiries, unreadInquiries, chartData };
    }, [processedInquiries]);

    const appointmentStats = useMemo(() => {
        const totalAppointments = processedAppointments.length;
        const today = startOfDay(new Date());
        const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse();

        const chartData = last7Days.map(day => ({
            date: format(day, 'MMM d'),
            appointments: processedAppointments.filter(appt => isSameDay(appt.appointmentDate, day)).length,
        }));
        
        return { totalAppointments, chartData };
    }, [processedAppointments]);


    if (clinicsLoading || inquiriesLoading || appointmentsLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4">Loading dashboard...</p>
            </div>
        );
    }
    
    if (!clinic) {
        return <p className="text-center text-muted-foreground py-8">You haven't set up a clinic yet. Please sign up to create one.</p>;
    }
    
    const chartConfig = {
      inquiries: {
        label: "Messages",
        color: "hsl(var(--chart-1))",
      },
      appointments: {
        label: "Appointments",
        color: "hsl(var(--chart-2))",
      },
    } satisfies ChartConfig;


    return (
        <div>
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Total Appointments" value={appointmentStats.totalAppointments} icon={CalendarDays} />
                <StatCard title="Total Messages" value={inquiryStats.totalInquiries} icon={Inbox} />
                <StatCard title="Unread Messages" value={inquiryStats.unreadInquiries} icon={MessageSquareWarning} />
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Messages</CardTitle>
                        <CardDescription>Messages received over the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <BarChart accessibilityLayer data={inquiryStats.chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <YAxis allowDecimals={false} />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent />}
                                />
                                <Bar dataKey="inquiries" fill="var(--color-inquiries)" radius={8} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Recent Appointments</CardTitle>
                        <CardDescription>Appointments scheduled over the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <BarChart accessibilityLayer data={appointmentStats.chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <YAxis allowDecimals={false} />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent />}
                                />
                                <Bar dataKey="appointments" fill="var(--color-appointments)" radius={8} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Your Clinic Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Clinic Name</h3>
                        <p className="text-muted-foreground">{clinic.name}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Clinic Status</h3>
                        <p className="text-muted-foreground">Currently <span className="font-bold text-primary">{clinic.isOpen ? 'Open' : 'Closed'}</span></p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Description</h3>
                        <p className="text-muted-foreground">{clinic.description}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
