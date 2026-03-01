"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Clinic } from '@/lib/types';


const clinicCategories: [Clinic['category'], ...Clinic['category'][]] = ['Dentist', 'General Physician', 'Cardiology', 'Pediatrics', 'Dermatology', 'Other'];

const signupSchema = z.object({
  clinicName: z.string().min(2, { message: "Clinic name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  category: z.enum(clinicCategories, { required_error: "Please select a category." }),
  location: z.string().min(3, { message: "Location must be at least 3 characters." }),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
        clinicName: '',
        email: '',
        location: "",
    }
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      const clinicsRef = collection(firestore, 'clinics');
      const clinicData = {
        name: data.clinicName,
        ownerId: user.uid,
        category: data.category,
        description: `Welcome to ${data.clinicName}!`,
        hours: '9 AM - 5 PM',
        imageUrl: 'https://picsum.photos/seed/newclinic/600/400',
        imageHint: 'clinic exterior',
        isOpen: true,
        location: data.location,
        lat: 20.5937,
        lng: 78.9629,
        phone: '1234567890',
        createdAt: serverTimestamp(),
      };
      
      addDoc(clinicsRef, clinicData)
        .catch((error) => {
            console.error("Error creating clinic:", error);
            const permissionError = new FirestorePermissionError({
                path: clinicsRef.path,
                operation: 'create',
                requestResourceData: clinicData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });

      toast({
        title: "Account Created",
        description: "Your clinic has been created and you are now logged in.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Clinic Account</CardTitle>
          <CardDescription>Get started with managing your clinic online.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="clinicName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Clinic Name</FormLabel>
                            <FormControl>
                                <Input placeholder="My Awesome Clinic" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Clinic Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {clinicCategories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Town/Village</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Springfield" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Login Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="manager@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Sign Up & Create Clinic'}
                </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
           <div className="mt-4 text-center text-sm text-muted-foreground">
            Not a clinic?{" "}
            <Link href="/signup-shop" className="underline text-primary">
              Register as a shop instead
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
