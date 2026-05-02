import React from 'react';

/**
 * Skeleton loader component with shimmer animation
 */
const SkeletonLoader = () => {
  return null; // Placeholder, we'll implement the specific skeletons below
};

/**
 * Dashboard skeleton loader - shows premium skeleton matching exact dashboard layout
 */
const DashboardSkeleton = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-pulse">
      
      {/* Stat cards skeleton — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-premium p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 bg-[#1A263D] rounded-full skeleton-shimmer" />
                <div className="h-8 w-28 bg-[#1A263D] rounded-[6px] skeleton-shimmer" />
                <div className="h-2.5 w-16 bg-[#1A263D] rounded-full skeleton-shimmer" />
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-[#1A263D] skeleton-shimmer" />
            </div>
            <div className="pt-4 border-t border-[#1A263D]">
              <div className="h-2.5 w-24 bg-[#1A263D] rounded-full skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mb-6">
        {/* Revenue chart */}
        <div className="lg:col-span-8 card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 w-36 bg-[#1A263D] rounded-full skeleton-shimmer" />
            <div className="h-6 w-20 bg-[#1A263D] rounded-full skeleton-shimmer" />
          </div>
          <div className="h-48 bg-[#1A263D] rounded-[8px] skeleton-shimmer" />
        </div>
        {/* Alerts panel */}
        <div className="lg:col-span-4 card-premium p-6">
          <div className="h-5 w-28 bg-[#1A263D] rounded-full skeleton-shimmer mb-5" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-[#1A263D] last:border-0">
                <div className="w-2 h-2 rounded-full bg-[#1A263D] mt-1.5 flex-shrink-0 skeleton-shimmer" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-[#1A263D] rounded-full w-full skeleton-shimmer" />
                  <div className="h-2.5 bg-[#1A263D] rounded-full w-2/3 skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Debtors */}
        <div className="lg:col-span-5 card-premium p-6">
          <div className="h-5 w-32 bg-[#1A263D] rounded-full skeleton-shimmer mb-5" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2.5">
                <div className="h-7 w-6 bg-[#1A263D] rounded skeleton-shimmer" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-[#1A263D] rounded-full w-3/4 skeleton-shimmer" />
                  <div className="h-2.5 bg-[#1A263D] rounded-full w-1/2 skeleton-shimmer" />
                </div>
                <div className="h-3 w-16 bg-[#1A263D] rounded-full skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
        {/* Payments table */}
        <div className="lg:col-span-7 card-premium p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="h-5 w-36 bg-[#1A263D] rounded-full skeleton-shimmer" />
            <div className="h-3 w-14 bg-[#1A263D] rounded-full skeleton-shimmer" />
          </div>
          <div className="space-y-1">
            <div className="flex gap-4 pb-3 border-b border-[#1A263D]">
              {[40, 28, 20, 12].map((w, i) => (
                <div key={i} className={`h-2.5 w-${w} bg-[#1A263D] rounded-full skeleton-shimmer`} />
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 py-3.5 border-b border-[#1A263D] last:border-0">
                <div className="h-3 w-32 bg-[#1A263D] rounded-full skeleton-shimmer" />
                <div className="h-3 w-20 bg-[#1A263D] rounded-full skeleton-shimmer" />
                <div className="h-3 w-16 bg-[#1A263D] rounded-full skeleton-shimmer" />
                <div className="h-3 w-10 bg-[#1A263D] rounded-full skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

/**
 * Table skeleton loader - shows 5 rows with 4 columns
 */
const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex space-x-4">
          <div className="bg-[#070D19] rounded h-10 w-10 flex-shrink-0 shimmer animate-shimmer"></div>
          <div className="flex-1 space-y-2">
            <div className="bg-[#070D19] rounded h-4 w-full shimmer animate-shimmer"></div>
            <div className="bg-[#070D19] rounded h-4 w-2/3 shimmer animate-shimmer"></div>
            <div className="bg-[#070D19] rounded h-4 w-1/2 shimmer animate-shimmer"></div>
            <div className="bg-[#070D19] rounded h-4 w-2/5 shimmer animate-shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Detail skeleton loader - shows avatar, heading, and form field placeholders
 */
const DetailSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="bg-[#070D19] rounded-full h-12 w-12 flex-shrink-0 shimmer animate-shimmer"></div>
        <div className="space-y-2">
          <div className="bg-[#070D19] rounded h-4 w-36 shimmer animate-shimmer"></div>
          <div className="bg-[#070D19] rounded h-4 w-48 shimmer animate-shimmer"></div>
          <div className="bg-[#070D19] rounded h-4 w-60 shimmer animate-shimmer"></div>
          <div className="bg-[#070D19] rounded h-4 w-72 shimmer animate-shimmer"></div>
          <div className="bg-[#070D19] rounded h-4 w-80 shimmer animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Card skeleton loader - single card with image/text placeholders
 */
const CardSkeleton = () => {
  return (
    <div className="bg-[#070D19] rounded-xl h-48 w-full shimmer animate-shimmer"></div>
  );
};

export { DashboardSkeleton, TableSkeleton, DetailSkeleton, CardSkeleton };
export default SkeletonLoader;