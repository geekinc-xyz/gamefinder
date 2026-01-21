
import { Skeleton } from "@/components/ui/skeleton";
import { StudioCardSkeleton } from "@/components/studio-card";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="mb-8">
            <Skeleton className="h-10 w-2/5" />
            <Skeleton className="h-6 w-3/5 mt-2" />
        </div>
        
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
                <Skeleton className="h-12 w-full" />
            </div>
            <div className="w-full sm:w-[240px]">
                <Skeleton className="h-12 w-full" />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 20 }).map((_, i) => (
                <StudioCardSkeleton key={i} />
            ))}
        </div>
    </div>
  );
}
