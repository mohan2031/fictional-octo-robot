import Image from "next/image";
import { getClinicById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail, MapPin, Phone, CheckCircle, XCircle, CalendarPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InquiryForm } from "@/components/inquiry-form";
import { AppointmentForm } from "@/components/appointment-form";

export default async function ClinicDetailPage({ params }: { params: { id: string } }) {
  const clinic = await getClinicById(params.id);

  if (!clinic) {
    notFound();
  }

  return (
    <>
      <div className="relative h-64 md:h-80 w-full">
        <Image
          src={clinic.imageUrl}
          alt={clinic.name}
          fill
          className="object-cover"
          data-ai-hint={clinic.imageHint}
          priority
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white p-4">
            <h1 className="text-4xl lg:text-6xl font-bold font-headline">{clinic.name}</h1>
            <p className="text-lg mt-2">{clinic.category}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <CardTitle className="text-2xl font-bold">About {clinic.name}</CardTitle>
                  <Badge variant={clinic.isOpen ? 'default' : 'destructive'} className="text-base px-4 py-2">
                    {clinic.isOpen ? <CheckCircle className="mr-2 h-5 w-5" /> : <XCircle className="mr-2 h-5 w-5" />}
                    {clinic.isOpen ? 'Open Now' : 'Closed'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{clinic.description}</p>
              </CardContent>
            </Card>
             <Card className="text-center p-8">
                <h3 className="text-xl font-semibold mb-2">Book an Appointment</h3>
                <p className="text-muted-foreground mb-4">Schedule your visit with us today.</p>
                <Dialog>
                    <DialogTrigger asChild>
                    <Button>
                        <CalendarPlus className="mr-2 h-4 w-4" /> Book Appointment
                    </Button>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Book an Appointment at {clinic.name}</DialogTitle>
                        <DialogDescription>
                            Please fill out the form below to schedule your visit.
                        </DialogDescription>
                    </DialogHeader>
                    <AppointmentForm clinicId={clinic.id} />
                    </DialogContent>
                </Dialog>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Clinic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-1 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-muted-foreground">{clinic.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-1 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold">Hours</h3>
                    <p className="text-muted-foreground">{clinic.hours}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 mt-1 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold">Contact</h3>
                    <Button variant="link" asChild className="p-0 h-auto text-base text-muted-foreground hover:text-primary">
                      <a href={`tel:${clinic.phone}`}>{clinic.phone}</a>
                    </Button>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4" variant="outline">
                      <Mail className="mr-2 h-4 w-4" /> Send a Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send a Message to {clinic.name}</DialogTitle>
                      <DialogDescription>
                        Ask a general question. For appointments, please use the booking form.
                      </DialogDescription>
                    </DialogHeader>
                    <InquiryForm clinicId={clinic.id} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
