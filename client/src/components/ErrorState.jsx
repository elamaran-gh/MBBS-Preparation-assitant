import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({ message = 'An error occurred while loading content.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center max-w-lg mx-auto bg-red-50/50 border border-red-100 rounded-2xl shadow-premium mt-6">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">System Notice</h3>
      <p className="text-slate-600 text-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition duration-200 shadow-sm"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
