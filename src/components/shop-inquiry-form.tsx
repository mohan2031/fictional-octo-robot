"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogClose } from './ui/dialog';
import { useFirestore, useUser } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const inquirySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  contact: z.string().min(5, { message: "Please enter a valid contact." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

export function ShopInquiryForm({ shopId, defaultMessage }: { shopId: string, defaultMessage?: string }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const db = useFirestore();
  const { user } = useUser();
  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      contact: "",
      message: defaultMessage || "",
    },
  });

  useEffect(() => {
    if (user) {
        if (user.displayName) form.setValue('name', user.displayName);
        if (user.email) form.setValue('contact', user.email);
    }
  }, [user, form]);

  async function onSubmit(values: InquiryFormData) {
    setIsSubmitting(true);
    
    const inquiryData = {
        ...values,
        shopId: shopId,
        createdAt: serverTimestamp(),
        isRead: false,
        ...(user && { userId: user.uid }),
    };

    const inquiriesRef = collection(db, 'shop-inquiries');
    addDoc(inquiriesRef, inquiryData)
    .then(() => {
        toast({
            title: "Message Sent!",
            description: "The shop has been notified.",
        });
        form.reset();
        // Consider closing the dialog programmatically by lifting state
    })
    .catch((error) => {
        console.error("Error sending message:", error);

        const permissionError = new FirestorePermissionError({
            path: inquiriesRef.path,
            operation: 'create',
            requestResourceData: inquiryData,
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Phone or Email</FormLabel>
              <FormControl>
                <Input placeholder="9876543210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Type your message here..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
