
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserList } from '@/lib/types';
import { Badge } from './ui/badge';

interface ListCardProps {
  list: UserList;
}

export function ListCard({ list }: ListCardProps) {
  return (
    <Link href={`/lists/${list.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:-translate-y-1 flex flex-col">
        <div className="aspect-[4/3] relative bg-muted">
          {list.coverUrl && (
            <Image
              src={list.coverUrl}
              alt={`Couverture de la liste ${list.name}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
              data-ai-hint="game list cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <CardContent className="p-4 bg-background/95 backdrop-blur-sm flex-1 flex flex-col justify-between">
            <div>
                <CardTitle className="text-lg leading-tight">{list.name}</CardTitle>
            </div>
            <div className="mt-2">
                <Badge variant="secondary">{list.itemCount} élément(s)</Badge>
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ListCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-[4/3] rounded-lg" />
       <div className="p-4 space-y-2">
         <Skeleton className="h-6 w-3/4" />
         <Skeleton className="h-5 w-1/4" />
       </div>
    </div>
  );
}
