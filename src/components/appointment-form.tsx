"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DialogClose } from './ui/dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';

const appointmentSchema = z.object({
  patientName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  appointmentDate: z.date({ required_error: "An appointment date is required." }),
  reason: z.string().min(10, { message: "Reason must be at least 10 characters." }),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export function AppointmentForm({ clinicId }: { clinicId: string }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientName: "",
      reason: "",
    },
  });

  useEffect(() => {
    if (user?.displayName) {
        form.setValue('patientName', user.displayName);
    }
  }, [user, form]);


  async function onSubmit(values: AppointmentFormData) {
    if (!user) {
        toast({
            title: "Not Logged In",
            description: "You must be logged in to book an appointment.",
            variant: "destructive",
        });
        router.push('/login');
        return;
    }
    
    setIsSubmitting(true);
    
    const appointmentData = {
        ...values,
        clinicId: clinicId,
        userId: user.uid,
        status: 'scheduled' as const,
        createdAt: serverTimestamp(),
    };

    const appointmentsRef = collection(db, 'appointments');
    addDoc(appointmentsRef, appointmentData)
    .then(() => {
        toast({
            title: "Appointment Booked!",
            description: "Your appointment has been successfully scheduled.",
        });
        form.reset();
        // Consider closing the dialog programmatically by lifting state
    })
    .catch((error) => {
        console.error("Error booking appointment:", error);

        const permissionError = new FirestorePermissionError({
            path: appointmentsRef.path,
            operation: 'create',
            requestResourceData: appointmentData,
          });
        errorEmitter.emit('permission-error', permissionError);
    })
    .finally(() => {
        setIsSubmitting(false);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="appointmentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Appointment Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Visit</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Annual check-up, tooth pain..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || userLoading}>
                {isSubmitting ? 'Booking...' : 'Book Appointment'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
