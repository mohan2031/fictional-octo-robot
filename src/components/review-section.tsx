
'use client';

import { useMemo, useState, useCallback } from 'react';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useUser } from '@/firebase';
import type { Review } from '@/lib/types';
import { Loader2, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ReviewStars } from './review-stars';
import { formatDistanceToNow } from 'date-fns';
import { ReviewForm } from './review-form';
import { Separator } from './ui/separator';
import { mapToReview } from '@/lib/type-mappers';
import { Progress } from '@/components/ui/progress';

function ReviewCard({ review }: { review: Review }) {
    return (
        <div className="flex gap-4 border-b py-6 last:border-b-0">
            <Avatar>
                <AvatarFallback>{review.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{review.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                    </p>
                </div>
                <ReviewStars rating={review.rating} size={16} showText={false} />
                <p className="text-sm text-muted-foreground pt-1">{review.comment}</p>
            </div>
        </div>
    );
}

interface ReviewSectionProps {
  businessId: string;
  businessType: 'clinic' | 'shop';
}

export function ReviewSection({ businessId, businessType }: ReviewSectionProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  // We need a key to force re-fetching when a review is submitted
  const [reviewSubmittedKey, setReviewSubmittedKey] = useState(0);

  const reviewsQuery = useMemo(() => {
    if (!firestore || !businessId) return null;
    return query(
      collection(firestore, 'reviews'),
      where('businessId', '==', businessId),
      orderBy('createdAt', 'desc')
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, businessId, reviewSubmittedKey]);

  const { data: reviewDocs, loading } = useCollection(reviewsQuery);

  const onReviewSubmit = useCallback(() => {
    setReviewSubmittedKey(prev => prev + 1);
  }, []);

  const processedReviews: Review[] = useMemo(() => {
    if (!reviewDocs) return [];
    return reviewDocs.map(mapToReview);
  }, [reviewDocs]);
  
  const { averageRating, totalReviews, ratingDistribution } = useMemo(() => {
    if (!processedReviews || processedReviews.length === 0) {
      return { 
          averageRating: 0, 
          totalReviews: 0, 
          ratingDistribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 } 
      };
    }
    const total = processedReviews.reduce((acc, review) => acc + review.rating, 0);
    const distribution = processedReviews.reduce((acc, review) => {
        const rating = Math.floor(review.rating);
        if (rating >= 1 && rating <= 5) {
            acc[rating as keyof typeof acc] = (acc[rating as keyof typeof acc] || 0) + 1;
        }
        return acc;
    }, { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 });
    
    return {
      averageRating: total / processedReviews.length,
      totalReviews: processedReviews.length,
      ratingDistribution: distribution
    };
  }, [processedReviews]);


  const hasUserReviewed = useMemo(() => {
    if (!user || !processedReviews) return false;
    return processedReviews.some(r => r.userId === user.uid);
  }, [user, processedReviews]);


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div className="space-y-1">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Star className="h-6 w-6 text-primary"/>
                    Ratings & Reviews
                </CardTitle>
                <CardDescription>See what other people are saying. {totalReviews > 0 && `Based on ${totalReviews} reviews.`}</CardDescription>
            </div>
            {totalReviews > 0 && (
                 <div className="flex gap-4 sm:gap-6 items-center bg-muted/50 p-4 rounded-lg border w-full max-w-sm">
                    <div className="flex flex-col items-center justify-center shrink-0 text-center">
                        <p className="text-4xl font-bold">{averageRating.toFixed(1)}</p>
                        <ReviewStars rating={averageRating} size={16} showText={false} />
                        <p className="text-xs text-muted-foreground mt-1">out of 5</p>
                    </div>
                    <div className="flex-grow space-y-1">
                        {Object.entries(ratingDistribution).map(([rating, count]) => (
                            <div key={rating} className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground w-6">{rating} <span className="sr-only">star</span></span>
                                <Progress value={(count / totalReviews) * 100} className="w-full h-2" />
                                <span className="text-xs font-bold text-muted-foreground w-8 text-right">{count}</span>
                            </div>
                        )).reverse()}
                    </div>
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
            {user ? (
                hasUserReviewed ? (
                    <p className="text-muted-foreground text-center py-4 bg-muted/50 rounded-md">You've already reviewed this business. Thank you for your feedback!</p>
                ) : (
                    <ReviewForm businessId={businessId} businessType={businessType} onReviewSubmit={onReviewSubmit} />
                )
            ) : (
                <p className="text-muted-foreground text-center py-4 bg-muted/50 rounded-md">Please log in to leave a review.</p>
            )}
        </div>
        
        <Separator />

        <div>
            <h3 className="text-lg font-semibold mb-2">All Reviews</h3>
            {loading ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : processedReviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first!</p>
            ) : (
                 <div className="space-y-4">
                    {processedReviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

