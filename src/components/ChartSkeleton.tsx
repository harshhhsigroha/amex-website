import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  type?: 'area' | 'bar' | 'pie' | 'composed';
  className?: string;
}

export const ChartSkeleton = ({ type = 'area', className = '' }: ChartSkeletonProps) => {
  if (type === 'pie') {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="relative">
          <Skeleton className="w-48 h-48 rounded-full" />
          <Skeleton className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-background" />
        </div>
        <div className="ml-6 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="w-20 h-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className={`flex items-end justify-around h-full gap-4 px-8 pb-8 ${className}`}>
        {[65, 80, 45, 90, 55, 75, 60].map((height, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <Skeleton 
              className="w-full rounded-t-md animate-pulse" 
              style={{ 
                height: `${height}%`,
                animationDelay: `${i * 100}ms`
              }} 
            />
            <Skeleton className="w-8 h-3" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'composed') {
    return (
      <div className={`flex items-end justify-around h-full gap-3 px-6 pb-8 ${className}`}>
        {[50, 70, 40, 85, 60, 75, 55, 80].map((height, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <div className="relative w-full flex items-end justify-center gap-1" style={{ height: `${height}%` }}>
              <Skeleton 
                className="w-1/3 rounded-t-md animate-pulse" 
                style={{ 
                  height: '100%',
                  animationDelay: `${i * 80}ms`
                }} 
              />
              <Skeleton 
                className="w-1/3 rounded-t-md animate-pulse" 
                style={{ 
                  height: '70%',
                  animationDelay: `${i * 80 + 40}ms`
                }} 
              />
            </div>
            <Skeleton className="w-6 h-2" />
          </div>
        ))}
      </div>
    );
  }

  // Default: Area chart skeleton
  return (
    <div className={`relative h-full px-6 py-4 ${className}`}>
      {/* Y-axis labels */}
      <div className="absolute left-0 top-4 bottom-8 flex flex-col justify-between">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="w-8 h-3" />
        ))}
      </div>
      
      {/* Chart area with wave effect */}
      <div className="ml-10 h-full flex items-end">
        <svg className="w-full h-3/4" viewBox="0 0 400 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="skeletonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" className="[stop-color:hsl(var(--muted))]" stopOpacity="0.8" />
              <stop offset="100%" className="[stop-color:hsl(var(--muted))]" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M0,180 Q50,160 100,140 T200,100 T300,120 T400,80 L400,200 L0,200 Z"
            fill="url(#skeletonGradient)"
            className="animate-pulse"
          />
          <path
            d="M0,180 Q50,160 100,140 T200,100 T300,120 T400,80"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
            strokeOpacity="0.3"
            className="animate-pulse"
          />
        </svg>
      </div>
      
      {/* X-axis labels */}
      <div className="absolute bottom-0 left-10 right-0 flex justify-between">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="w-10 h-3" />
        ))}
      </div>
    </div>
  );
};

export const StatCardSkeleton = () => (
  <div className="p-6 rounded-2xl glass-card">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="w-16 h-5 rounded-full" />
    </div>
    <Skeleton className="w-24 h-8 mb-2" />
    <Skeleton className="w-32 h-4" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-fade-in">
    {/* Header skeleton */}
    <div className="space-y-2">
      <Skeleton className="w-48 h-8" />
      <Skeleton className="w-64 h-4" />
    </div>

    {/* Stats grid skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Charts grid skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="p-6 rounded-2xl glass-card">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="w-40 h-5" />
            <Skeleton className="w-20 h-4" />
          </div>
          <div className="h-64">
            <ChartSkeleton type={i % 3 === 0 ? 'pie' : i % 2 === 0 ? 'bar' : 'area'} />
          </div>
        </div>
      ))}
    </div>
  </div>
);
