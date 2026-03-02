'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating.').max(5),
  comment: z.string().min(10, 'Your review must be at least 10 characters long.'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  businessId: string;
  businessType: 'clinic' | 'shop';
  onReviewSubmit: () => void;
}

export function ReviewForm({ businessId, businessType, onReviewSubmit }: ReviewFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const currentRating = form.watch('rating');

  async function onSubmit(values: ReviewFormData) {
    if (!user) {
      toast({
        title: 'Not Logged In',
        description: 'You must be logged in to leave a review.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    
    // Check if user has already reviewed this business
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('businessId', '==', businessId), where('userId', '==', user.uid));
    const existingReviewSnap = await getDocs(q);

    if (!existingReviewSnap.empty) {
        toast({
            title: 'Already Reviewed',
            description: 'You have already submitted a review for this business.',
            variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
    }


    const reviewData = {
      ...values,
      businessId,
      businessType,
      userId: user.uid,
      authorName: user.displayName || 'Anonymous',
      createdAt: serverTimestamp(),
    };

    addDoc(reviewsRef, reviewData)
      .then(() => {
        toast({
          title: 'Review Submitted!',
          description: 'Thank you for your feedback.',
        });
        form.reset();
        onReviewSubmit(); // Callback to re-fetch reviews
      })
      .catch((error) => {
        console.error('Error submitting review:', error);

        const permissionError = new FirestorePermissionError({
          path: reviewsRef.path,
          operation: 'create',
          requestResourceData: reviewData,
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
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Rating</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'cursor-pointer transition-colors',
                        (hoverRating >= star || currentRating >= star)
                          ? 'text-primary fill-primary'
                          : 'text-muted-foreground'
                      )}
                      onMouseEnter={() => setHoverRating(star)}
                      onClick={() => field.onChange(star)}
                      size={24}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea placeholder="Share your experience..." {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !user}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
