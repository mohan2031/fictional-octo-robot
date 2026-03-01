import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold font-headline">Settings</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Shop Settings</CardTitle>
                    <CardDescription>Manage your shop details and preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Settings page is under construction.</p>
                </CardContent>
            </Card>
        </div>
    )
}
