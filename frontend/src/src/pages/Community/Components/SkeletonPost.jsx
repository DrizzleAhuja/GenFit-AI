import React from "react";

const SkeletonPost = () => {
  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.8)] overflow-hidden mb-6 animate-pulse">
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-[#1F2937]" />
      <div className="p-5 sm:p-6 pt-7">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F2937]" />
            <div className="space-y-2">
              <div className="w-32 h-4 bg-[#1F2937] rounded" />
              <div className="w-20 h-3 bg-[#1F2937] rounded" />
            </div>
          </div>
          <div className="w-16 h-5 bg-[#1F2937] rounded-full" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="w-full h-4 bg-[#1F2937] rounded" />
          <div className="w-5/6 h-4 bg-[#1F2937] rounded" />
          <div className="w-4/6 h-4 bg-[#1F2937] rounded" />
        </div>

        {/* Actions Skeleton */}
        <div className="flex items-center gap-6 border-t border-[#1F2937] pt-4">
          <div className="w-16 h-4 bg-[#1F2937] rounded" />
          <div className="w-16 h-4 bg-[#1F2937] rounded" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonPost;
