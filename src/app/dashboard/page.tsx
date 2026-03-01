import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePenLine, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h2 className="text-3xl font-bold font-headline">Welcome back, Shop Owner!</h2>
        <Button variant="outline">
          <Bell className="mr-2 h-4 w-4" />
          View Notifications
          <Badge className="ml-2">3</Badge>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Shop Profile</CardTitle>
            <Button variant="outline" size="sm">
              <FilePenLine className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
          <CardDescription>
            This is how your shop appears to customers. Keep it updated!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Shop Name</h3>
            <p className="text-muted-foreground">Ganesh Kirana Store</p>
          </div>
          <div>
            <h3 className="font-semibold">Shop Status</h3>
            <p className="text-muted-foreground">Currently <span className="font-bold text-primary">Open</span></p>
          </div>
          <div>
            <h3 className="font-semibold">Description</h3>
            <p className="text-muted-foreground">Your one-stop shop for all daily needs, fresh vegetables, and household items. Serving the community for over 20 years.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
