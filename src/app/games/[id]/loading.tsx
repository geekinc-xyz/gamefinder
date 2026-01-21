import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="animate-pulse">
        <div className="relative h-[40vh] md:h-[50vh] w-full">
            <Skeleton className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute top-4 left-4">
                <Skeleton className="h-8 w-32 rounded-md" />
            </div>
        </div>

        <main className="container mx-auto px-4 sm:px-6 md:px-8 pb-16 -mt-32 md:-mt-48 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                <aside className="md:col-span-1 lg:col-span-1">
                    <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                    <div className="mt-6 space-y-6">
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                </aside>

                <div className="md:col-span-2 lg:col-span-3 space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-2/3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                    
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
      </main>
    </div>
  )
}
