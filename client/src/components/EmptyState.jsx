import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ 
  title = 'No questions found', 
  message = 'Try modifying your search query or adjusting your filters to locate relevant study topics.' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-5 border border-slate-200 shadow-premium">
        <Inbox size={28} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
    </div>
  );
};

export default EmptyState;
