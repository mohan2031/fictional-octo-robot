'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewStarsProps {
  rating: number;
  totalStars?: number;
  size?: number;
  className?: string;
  showText?: boolean;
}

export function ReviewStars({ rating, totalStars = 5, size = 16, className, showText = true }: ReviewStarsProps) {
  const fullStars = Math.floor(rating);
  const partialStar = rating % 1; // This part is for future half-star implementation
  const emptyStars = totalStars - Math.ceil(rating);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} fill="hsl(var(--primary))" strokeWidth={0} style={{ width: size, height: size }} />
        ))}
        {/* Partial star logic can be added here if needed */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} fill="hsl(var(--muted))" strokeWidth={0} style={{ width: size, height: size }} />
        ))}
      </div>
      {showText && <span className="text-sm text-muted-foreground">({rating.toFixed(1)})</span>}
    </div>
  );
}
