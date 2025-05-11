import React from 'react';

const ElectionSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="h-48 w-full bg-gray-200 animate-pulse" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="w-3/4 h-6 bg-gray-200 rounded mb-2 animate-pulse" />
        <div className="w-full h-16 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="w-1/3 h-5 bg-gray-200 rounded animate-pulse" />
          <div className="w-1/4 h-5 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between">
            <div className="w-1/3 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-1/3 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionSkeleton;