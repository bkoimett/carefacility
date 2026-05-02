import React from 'react';

/**
 * Skeleton loader component with shimmer animation
 */
const SkeletonLoader = () => {
  return null; // Placeholder, we'll implement the specific skeletons below
};

/**
 * Dashboard skeleton loader - shows 3-4 card placeholders
 */
const DashboardSkeleton = () => {
  return (
    <div className="grid gap-4">
      <div className="bg-[#070D19] rounded-xl h-48 w-full shimmer animate-shimmer"></div>
      <div className="bg-[#070D19] rounded-xl h-48 w-full shimmer animate-shimmer"></div>
      <div className="bg-[#070D19] rounded-xl h-48 w-full shimmer animate-shimmer"></div>
      <div className="bg-[#070D19] rounded-xl h-48 w-full shimmer animate-shimmer"></div>
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