interface ImageSkeletonProps {
  height?: number;
}

export function ImageSkeleton({ height = 300 }: ImageSkeletonProps) {
  return (
    <div
      className="relative overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-lg"
      style={{ height: `${height}px` }}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
    </div>
  );
}
