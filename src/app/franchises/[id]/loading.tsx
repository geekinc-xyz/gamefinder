
import { GameCardSkeleton } from "@/components/game-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
        <div className="relative h-[30vh] md:h-[40vh] w-full">
            <Skeleton className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute top-4 left-4 z-10">
                <Skeleton className="h-8 w-40 rounded-md" />
            </div>
             <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-10">
                <div className="container mx-auto px-4 sm:px-6 md:px-8">
                    <Skeleton className="h-16 w-3/5 rounded-md" />
                </div>
            </div>
        </div>

        <main className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
            <Skeleton className="h-10 w-1/4 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
                <GameCardSkeleton key={i} />
            ))}
            </div>
      </main>
    </div>
  )
}
