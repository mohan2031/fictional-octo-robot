
"use client";

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import type { Shop, ShopInquiry, Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Inbox, MessageSquareWarning, Package } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { subDays, format, startOfDay, isSameDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { mapToShop, mapToShopInquiry } from '@/lib/type-mappers';


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

    const shopsQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, "shops"),
            where("ownerId", "==", user.uid)
        );
    }, [firestore, user]);

    const { data: shopDocs, loading: shopsLoading } = useCollection(shopsQuery);
    
    const shop: Shop | undefined = useMemo(() => {
        return shopDocs && shopDocs.length > 0 ? mapToShop(shopDocs[0]) : undefined;
    }, [shopDocs]);
    const shopId = shop?.id;

    const productsQuery = useMemo(() => {
        if (!firestore || !shopId) return null;
        return query(collection(firestore, "shops", shopId, "products"));
    }, [firestore, shopId]);

    const { data: products, loading: productsLoading } = useCollection(productsQuery);

    const inquiriesQuery = useMemo(() => {
        if (!firestore || !shopId) return null;
        return query(
            collection(firestore, "shop-inquiries"),
            where("shopId", "==", shopId)
        );
    }, [firestore, shopId]);

    const { data: inquiryDocs, loading: inquiriesLoading } = useCollection(inquiriesQuery);

    const processedInquiries: ShopInquiry[] = useMemo(() => {
        if (!inquiryDocs) return [];
        return inquiryDocs.map(mapToShopInquiry);
    }, [inquiryDocs]);

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


    if (shopsLoading || inquiriesLoading || productsLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4">Loading dashboard...</p>
            </div>
        );
    }
    
    if (!shop) {
        return <p className="text-center text-muted-foreground py-8">You haven't set up a shop yet. Please sign up to create one.</p>;
    }

    const totalProducts = products?.length || 0;
    
    const chartConfig = {
      inquiries: {
        label: "Inquiries",
        color: "hsl(var(--chart-1))",
      },
    } satisfies ChartConfig;


    return (
        <div>
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Total Products" value={totalProducts} icon={Package} />
                <StatCard title="Total Messages" value={inquiryStats.totalInquiries} icon={Inbox} />
                <StatCard title="Unread Messages" value={inquiryStats.unreadInquiries} icon={MessageSquareWarning} />
            </div>

             <Card className="mt-8">
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

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Your Shop Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Shop Name</h3>
                        <p className="text-muted-foreground">{shop.name}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Shop Status</h3>
                        <p className="text-muted-foreground">Currently <span className="font-bold text-primary">{shop.isOpen ? 'Open' : 'Closed'}</span></p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Description</h3>
                        <p className="text-muted-foreground">{shop.description}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
