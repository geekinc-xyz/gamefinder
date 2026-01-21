
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Game } from '@/lib/types';
import { Badge } from './ui/badge';
import { Quote } from 'lucide-react';

interface AiGameCardProps {
  game: Game;
}

export function AiGameCard({ game }: AiGameCardProps) {
  return (
    <Link href={`/games/${game.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:-translate-y-1 flex flex-col">
        <CardHeader className="p-0">
          <div className="aspect-[3/4] relative">
            <Image
              src={game.coverUrl}
              alt={game.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
              data-ai-hint="game cover"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col">
          <CardTitle className="text-lg leading-tight mb-2">{game.name}</CardTitle>
           {game.reason && (
            <div className="text-sm text-muted-foreground mt-2 flex items-start gap-2 border-l-2 border-primary/50 pl-3 italic">
                <Quote className="h-4 w-4 shrink-0 mt-1" />
                <p>{game.reason}</p>
            </div>
           )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
            {game.rating > 0 && <Badge variant="secondary">{game.rating.toFixed(0)}</Badge>}
        </CardFooter>
      </Card>
    </Link>
  );
}

export function AiGameCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-[3/4] rounded-lg" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}
