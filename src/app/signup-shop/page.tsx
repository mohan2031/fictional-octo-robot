"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
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
import type { Shop } from '@/lib/types';
import { getPlaceholderImage } from '@/lib/placeholder-images';


const shopCategories: [Shop['category'], ...Shop['category'][]] = ['Grocery', 'Electronics', 'Plumbing', 'Electrician', 'Other'];

const signupSchema = z.object({
  shopName: z.string().min(2, { message: "Shop name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  category: z.enum(shopCategories, { required_error: "Please select a category." }),
  location: z.string().min(3, { message: "Location must be at least 3 characters." }),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupShopPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
        shopName: '',
        email: '',
        location: "",
    }
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: data.shopName });

      const userProfileRef = doc(firestore, 'users', user.uid);
      const userProfileData = {
          displayName: data.shopName,
          email: user.email,
          role: 'owner',
          createdAt: serverTimestamp()
      };
      setDoc(userProfileRef, userProfileData).catch((error) => {
          console.error("Error creating user profile:", error);
          const permissionError = new FirestorePermissionError({
              path: userProfileRef.path,
              operation: 'create',
              requestResourceData: userProfileData,
          });
          errorEmitter.emit('permission-error', permissionError);
          // We don't re-throw here as the primary account creation succeeded.
      });


      const placeholder = getPlaceholderImage(data.category);
      const shopsRef = collection(firestore, 'shops');
      const shopData = {
        name: data.shopName,
        ownerId: user.uid,
        category: data.category,
        description: `Welcome to ${data.shopName}!`,
        hours: '9 AM - 5 PM',
        imageUrl: placeholder.imageUrl,
        imageHint: placeholder.imageHint,
        isOpen: true,
        location: data.location,
        lat: 20.5937,
        lng: 78.9629,
        phone: '1234567890',
        products: [],
        createdAt: serverTimestamp(),
      };
      
      addDoc(shopsRef, shopData)
        .catch((error) => {
            console.error("Error creating shop:", error);
            const permissionError = new FirestorePermissionError({
                path: shopsRef.path,
                operation: 'create',
                requestResourceData: shopData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });

      toast({
        title: "Account Created",
        description: "Your shop has been created and you are now logged in.",
      });
      router.push('/shop-dashboard');
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
          <CardTitle className="text-2xl">Create Your Shop Account</CardTitle>
          <CardDescription>Get started with managing your business online.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="shopName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shop Name</FormLabel>
                            <FormControl>
                                <Input placeholder="My Awesome Shop" {...field} />
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
                            <FormLabel>Shop Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {shopCategories.map(cat => (
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
                {isSubmitting ? 'Creating Account...' : 'Sign Up & Create Shop'}
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
            Not a shop?{" "}
            <Link href="/signup" className="underline text-primary">
              Register as a clinic instead
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
