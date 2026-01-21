
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlatformIcon } from '@/components/icons';
import type { Game } from '@/lib/types';
import { FavoriteButton } from './favorite-button';
import { AddToListButton } from './add-to-list-button';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 group/card flex flex-col">
        <CardHeader className="p-0 relative">
            <Link href={`/games/${game.id}`} className="group block">
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
            </Link>
             <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <FavoriteButton item={{ id: game.id, type: 'game', name: game.name, coverUrl: game.coverUrl }} />
                <AddToListButton item={{ id: game.id, type: 'game', name: game.name, coverUrl: game.coverUrl }} />
            </div>
        </CardHeader>
        <CardContent className="p-4 flex-1">
            <Link href={`/games/${game.id}`}>
                <CardTitle className="text-lg leading-tight truncate hover:text-primary">{game.name}</CardTitle>
            </Link>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
            {game.platforms?.slice(0, 3).map(p => (
                <PlatformIcon key={p.id} platform={p.name as any} className="h-4 w-4" />
            ))}
            </div>
            {game.rating > 0 && <Badge variant="secondary">{game.rating.toFixed(0)}</Badge>}
        </CardFooter>
    </Card>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-[3/4] rounded-lg" />
      <Skeleton className="h-6 w-3/4" />
      <div className="flex justify-between">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-5 w-1/4" />
      </div>
    </div>
  );
}
