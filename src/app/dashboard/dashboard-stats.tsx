"use client";

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import type { Shop, Inquiry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Inbox, MessageSquareWarning } from 'lucide-react';
import { Loader2 } from 'lucide-react';

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

    const { data: shops, loading: shopsLoading } = useCollection(shopsQuery);
    
    const shop = shops?.[0] as Shop | undefined;
    const shopId = shop?.id;

    const inquiriesQuery = useMemo(() => {
        if (!firestore || !shopId) return null;
        return query(
            collection(firestore, "inquiries"),
            where("shopId", "==", shopId)
        );
    }, [firestore, shopId]);

    const { data: inquiries, loading: inquiriesLoading } = useCollection(inquiriesQuery);

    if (shopsLoading || inquiriesLoading) {
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

    const totalProducts = shop.products?.length || 0;
    const totalInquiries = inquiries?.length || 0;
    const unreadInquiries = inquiries?.filter(inq => !(inq as Inquiry).isRead).length || 0;

    return (
        <div>
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Total Products" value={totalProducts} icon={Package} />
                <StatCard title="Total Inquiries" value={totalInquiries} icon={Inbox} />
                <StatCard title="Unread Inquiries" value={unreadInquiries} icon={MessageSquareWarning} />
            </div>

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
