import { Skeleton } from "@/components/ui/skeleton";

export function BookCardSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-md border border-neutral-100">
      <Skeleton className="w-full h-[280px] rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full mt-4" />
      </div>
    </div>
  );
}

export function BooksPageSkeleton() {
  return (
    <div className="flex-1 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-4" />
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="flex-1 h-12" />
            <Skeleton className="w-24 h-12 sm:w-32" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Skeleton */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[...Array(8)].map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
