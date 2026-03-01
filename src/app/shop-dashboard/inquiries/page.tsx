import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InquiryList } from "./inquiry-list";

export default function ShopInquiriesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold font-headline">Customer Messages</h2>
                <p className="text-muted-foreground">Messages and questions from customers.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Inbox</CardTitle>
                    <CardDescription>Here are the latest messages for your shop.</CardDescription>
                </CardHeader>
                <CardContent>
                    <InquiryList />
                </CardContent>
            </Card>
        </div>
    )
}
