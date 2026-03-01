import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin } from 'lucide-react';
import type { Clinic } from '@/lib/types';

interface ClinicCardProps {
  clinic: Clinic & { distance: number | null };
}

export function ClinicCard({ clinic }: ClinicCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={clinic.imageUrl}
            alt={clinic.name}
            fill
            className="object-cover"
            data-ai-hint={clinic.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg font-bold">{clinic.name}</CardTitle>
          <Badge variant={clinic.isOpen ? 'default' : 'destructive'}>
            {clinic.isOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{clinic.category}</p>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{clinic.description}</p>
        {clinic.distance !== null && (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary mt-2">
            <MapPin className="h-4 w-4" />
            <span>{clinic.distance.toFixed(1)} km away</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 bg-secondary/30">
        <Button asChild className="w-full">
          <Link href={`/clinics/${clinic.id}`}>
            View Clinic <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
