
"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const profileSchema = z.object({
  displayName: z.string().min(2, "Your name must be at least 2 characters."),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
    profile: UserProfile;
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        displayName: profile.displayName || '',
    },
  });

  const handleSaveChanges = async (values: ProfileFormData) => {
    if (!firestore || !user) {
        toast({ title: 'Error', description: 'You must be logged in to update your profile.', variant: 'destructive' });
        return;
    }
    
    setIsSaving(true);
    
    try {
        // Update Firebase Auth profile
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: values.displayName });
        } else {
            throw new Error("No authenticated user found.");
        }

        // Update Firestore profile document
        const profileRef = doc(firestore, 'users', user.uid);
        await updateDoc(profileRef, { displayName: values.displayName }).catch((error) => {
          const permissionError = new FirestorePermissionError({
            path: profileRef.path,
            operation: 'update',
            requestResourceData: { displayName: values.displayName },
          });
          errorEmitter.emit('permission-error', permissionError);
          throw error;
        });

        toast({
            title: "Profile Updated!",
            description: "Your name has been successfully updated.",
        });

    } catch (error: any) {
        console.error("Error saving profile details:", error);
        if (!(error instanceof FirestorePermissionError)) {
             toast({
              title: "Error Saving Profile",
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
        <form onSubmit={form.handleSubmit(handleSaveChanges)} className="space-y-4">
            <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    </Form>
  );
}
