'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, startOfDay, endOfDay, setHours, setMinutes } from 'date-fns';
import { DialogClose } from './ui/dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';

const appointmentSchema = z.object({
  patientName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  appointmentDate: z.date({ required_error: 'An appointment date is required.' }),
  appointmentTime: z.string({ required_error: 'Please select a time slot.' }),
  reason: z.string().min(10, { message: 'Reason must be at least 10 characters.' }),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00',
  '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

export function AppointmentForm({ clinicId }: { clinicId: string }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientName: '',
      reason: '',
    },
  });

  const selectedDate = form.watch('appointmentDate');

  useEffect(() => {
    if (user?.displayName) {
      form.setValue('patientName', user.displayName);
    }
  }, [user, form]);

  useEffect(() => {
    if (!selectedDate || !db) {
        setBookedSlots([]);
        return;
    };

    const fetchBookedSlots = async () => {
      setIsFetchingSlots(true);
      form.setValue('appointmentTime', ''); // Reset time when date changes
      try {
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);
        
        const q = query(
          collection(db, 'appointments'),
          where('clinicId', '==', clinicId),
          where('appointmentDate', '>=', start),
          where('appointmentDate', '<=', end)
        );

        const querySnapshot = await getDocs(q);
        const slots = querySnapshot.docs.map(doc => {
            const timestamp = doc.data().appointmentDate as Timestamp;
            return format(timestamp.toDate(), 'HH:mm');
        });
        setBookedSlots(slots);
      } catch (error) {
        console.error("Error fetching booked slots: ", error);
        toast({
            title: "Error",
            description: "Could not fetch available time slots.",
            variant: "destructive"
        })
      } finally {
        setIsFetchingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, db, clinicId, form, toast]);

  async function onSubmit(values: AppointmentFormData) {
    if (!user) {
      toast({
        title: 'Not Logged In',
        description: 'You must be logged in to book an appointment.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    setIsSubmitting(true);

    const [hours, minutes] = values.appointmentTime.split(':').map(Number);
    const finalAppointmentDate = setMinutes(setHours(values.appointmentDate, hours), minutes);

    const appointmentData = {
      patientName: values.patientName,
      reason: values.reason,
      appointmentDate: Timestamp.fromDate(finalAppointmentDate),
      clinicId: clinicId,
      userId: user.uid,
      status: 'scheduled' as const,
      createdAt: serverTimestamp(),
    };

    const appointmentsRef = collection(db, 'appointments');
    addDoc(appointmentsRef, appointmentData)
      .then(() => {
        toast({
          title: 'Appointment Booked!',
          description: 'Your appointment has been successfully scheduled.',
        });
        form.reset();
        // This will find the DialogClose button and click it.
        document.getElementById('close-appointment-dialog')?.click();
      })
      .catch((error) => {
        console.error('Error booking appointment:', error);

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
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedDate && (
           <FormField
              control={form.control}
              name="appointmentTime"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Select a Time</FormLabel>
                     <FormControl>
                        <div className="grid grid-cols-4 gap-2 pt-2">
                            {isFetchingSlots ? (
                                <div className="col-span-4 flex items-center justify-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                timeSlots.map((time) => (
                                    <Button
                                        key={time}
                                        type="button"
                                        variant={field.value === time ? 'default' : 'outline'}
                                        disabled={bookedSlots.includes(time)}
                                        onClick={() => field.onChange(time)}
                                    >
                                        {time}
                                    </Button>
                                ))
                            )}
                        </div>
                     </FormControl>
                     <FormMessage />
                </FormItem>
              )}
            />
        )}

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
        <div className="flex justify-end gap-2 pt-4">
          <DialogClose asChild>
            <Button id="close-appointment-dialog" type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Booking...' : 'Book Appointment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
