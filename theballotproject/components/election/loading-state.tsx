import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-24 bg-gray-200"></div>
      
      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
        
        <div className="flex justify-end pt-4">
          <div className="h-10 bg-gray-200 rounded w-40"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;