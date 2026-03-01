
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AppointmentList } from "./appointment-list";

export default function AppointmentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-headline">Manage Appointments</h2>
          <p className="text-muted-foreground">View and manage upcoming patient appointments.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>A list of all scheduled appointments for your clinic.</CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentList />
        </CardContent>
      </Card>
    </div>
  );
}
