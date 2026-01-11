interface ImageSkeletonProps {
  height?: number;
}

export function ImageSkeleton({ height = 300 }: ImageSkeletonProps) {
  return (
    <div
      className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded-lg"
      style={{ height: `${height}px` }}
    >
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
