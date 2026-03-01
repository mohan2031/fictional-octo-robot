"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Clinic } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


const clinicSchema = z.object({
  name: z.string().min(2, "Clinic name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  location: z.string().min(3, "Location is required."),
  phone: z.string().min(10, "A valid phone number is required."),
  hours: z.string().min(3, "Opening hours are required."),
  isOpen: z.boolean(),
});

type ClinicFormData = z.infer<typeof clinicSchema>;


interface EditClinicFormProps {
    clinic: Clinic;
}

export function EditClinicForm({ clinic }: EditClinicFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();
  const firestore = useFirestore();

  const form = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
        name: clinic.name || '',
        description: clinic.description || '',
        location: clinic.location || '',
        phone: clinic.phone || '',
        hours: clinic.hours || '',
        isOpen: clinic.isOpen || false,
    },
  });


  const handleSaveChanges = async (values: ClinicFormData) => {
    if (!firestore || !clinic.id) return;
    
    setIsSaving(true);
    
    try {
        const clinicRef = doc(firestore, 'clinics', clinic.id);
        
        const updatedData = {
            ...values,
        };

        updateDoc(clinicRef, updatedData).catch((error) => {
          const permissionError = new FirestorePermissionError({
            path: clinicRef.path,
            operation: 'update',
            requestResourceData: values,
          });
          errorEmitter.emit('permission-error', permissionError);
          throw error;
        });

        toast({
            title: "Clinic Updated!",
            description: "Your clinic details have been successfully updated.",
        });
        router.refresh();

    } catch (error: any) {
        console.error("Error saving clinic details:", error);
        if (!(error instanceof FirestorePermissionError)) {
             toast({
              title: "Error Saving Clinic",
              description: error.message || "An unexpected error occurred.",
              variant: "destructive",
            });
        }
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSaveChanges)} className="space-y-6">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Clinic Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Clinic Description</FormLabel>
                        <FormControl>
                            <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location / Address</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Opening Hours</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., 9 AM - 6 PM, Mon-Sat" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="isOpen"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background/50">
                        <div className="space-y-0.5">
                            <FormLabel>Clinic Status</FormLabel>
                            <p className="text-sm text-muted-foreground">
                                Set your clinic to open or closed for patients.
                            </p>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    </Form>
  );
}
