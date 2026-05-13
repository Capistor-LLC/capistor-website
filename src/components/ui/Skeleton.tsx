interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded ${className}`}
    />
  );
}

export function BlogPostSkeleton() {
  return (
    <article className="max-w-3xl mx-auto px-6 pt-32 pb-20 lg:pt-40">
      <Skeleton className="h-3 w-20 mb-8" />
      <Skeleton className="h-12 w-full mb-3" />
      <Skeleton className="h-12 w-3/4 mb-6" />
      <Skeleton className="h-6 w-2/3 mb-10" />
      <Skeleton className="aspect-[16/9] w-full mb-12" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full mt-6" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </article>
  );
}

export function BlogIndexSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16 space-y-10">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border-b border-gray-100 pb-10 sm:flex sm:gap-8">
          <div className="flex-1">
            <Skeleton className="h-7 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-4" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="hidden sm:block w-40 h-28 lg:w-48 lg:h-32 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function ProductsSkeleton() {
  return (
    <div className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-4 w-32 mx-auto mb-4" />
        <Skeleton className="h-20 w-2/3 mx-auto mb-8" />
        <Skeleton className="h-6 w-1/2 mx-auto mb-16" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-sexyblue/10">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-[55vh] sm:h-[65vh] lg:h-[75vh] rounded-none" />
          ))}
        </div>
      </div>
    </div>
  );
}
