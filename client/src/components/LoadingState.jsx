import React from 'react';

export const LoadingState = ({ message = 'Loading questions and references...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Premium glowing custom spinner */}
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-medical-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-medical-600 animate-spin"></div>
      </div>
      <p className="text-slate-600 font-medium animate-pulse">{message}</p>
      
      {/* Skeletons block */}
      <div className="w-full max-w-2xl mt-8 space-y-4">
        <div className="h-28 w-full bg-slate-100 rounded-xl animate-pulse border border-slate-200"></div>
        <div className="h-28 w-full bg-slate-100 rounded-xl animate-pulse border border-slate-200 opacity-60"></div>
        <div className="h-28 w-full bg-slate-100 rounded-xl animate-pulse border border-slate-200 opacity-30"></div>
      </div>
    </div>
  );
};

export default LoadingState;
