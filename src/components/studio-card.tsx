
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Studio } from '@/lib/types';
import { Badge } from './ui/badge';
import { Building } from 'lucide-react';

interface StudioCardProps {
  studio: Studio;
}

export function StudioCard({ studio }: StudioCardProps) {
  const hasLogo = studio.logoUrl && !studio.logoUrl.endsWith('placeholder.jpg');
  
  return (
    <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 flex flex-col justify-center items-center text-center p-4">
      <div className="w-32 h-32 relative mb-4 flex items-center justify-center">
        {hasLogo ? (
          <Image
            src={studio.logoUrl}
            alt={`${studio.name} logo`}
            fill
            className="object-contain"
            sizes="128px"
            data-ai-hint="company logo"
          />
        ) : (
          <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
            <Building className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="p-0 flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold leading-tight">{studio.name}</h3>
          <Badge variant="secondary" className="mt-2">{studio.developed.length} Jeux</Badge>
      </CardContent>
    </Card>
  );
}

export function StudioCardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-4 border rounded-lg h-full space-y-4">
      <Skeleton className="w-32 h-32 rounded-full" />
      <div className="w-full flex flex-col items-center space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-1/4" />
      </div>
    </div>
  );
}
