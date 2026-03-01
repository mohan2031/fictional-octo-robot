import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InquiryList } from "./inquiry-list";

export default function InquiriesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold font-headline">Customer Inquiries</h2>
                <p className="text-muted-foreground">Messages from customers about your products and services.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Inbox</CardTitle>
                    <CardDescription>Here are the latest inquiries for your shop.</CardDescription>
                </CardHeader>
                <CardContent>
                    <InquiryList />
                </CardContent>
            </Card>
        </div>
    )
}
