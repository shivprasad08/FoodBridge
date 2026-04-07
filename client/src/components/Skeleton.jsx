const SkeletonBox = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
)

export const ListingCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <SkeletonBox className="h-40 w-full rounded-none" />
    <div className="space-y-3 p-4">
      <SkeletonBox className="h-5 w-3/4" />
      <SkeletonBox className="h-4 w-full" />
      <SkeletonBox className="h-4 w-1/2" />
      <div className="flex gap-2 pt-2">
        <SkeletonBox className="h-3 w-16" />
        <SkeletonBox className="h-3 w-16" />
      </div>
      <SkeletonBox className="mt-2 h-10 w-full" />
    </div>
  </div>
)

export const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <SkeletonBox className="mb-3 h-4 w-24" />
    <SkeletonBox className="mb-1 h-8 w-16" />
    <SkeletonBox className="h-3 w-20" />
  </div>
)

export const TaskCardSkeleton = () => (
  <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="flex justify-between">
      <SkeletonBox className="h-5 w-1/2" />
      <SkeletonBox className="h-5 w-16 rounded-full" />
    </div>
    <SkeletonBox className="h-4 w-full" />
    <SkeletonBox className="h-4 w-3/4" />
    <SkeletonBox className="h-10 w-full" />
  </div>
)

export const NotificationSkeleton = () => (
  <div className="flex gap-3 border-b border-gray-50 px-4 py-3">
    <SkeletonBox className="h-8 w-8 flex-shrink-0 rounded-full" />
    <div className="flex-1 space-y-2">
      <SkeletonBox className="h-4 w-full" />
      <SkeletonBox className="h-3 w-1/3" />
    </div>
  </div>
)

export default SkeletonBox
