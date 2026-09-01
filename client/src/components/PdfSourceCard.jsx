import React from 'react';
import { FileText } from 'lucide-react';

// Displays one retrieved PDF chunk that backed an AI answer — shown alongside
// AnswerSection so the student can see exactly what part of their document
// was used, similar in spirit to ReferenceCard for the question bank, but
// shaped around a chunk excerpt + relevance score instead of a full reference.
export const PdfSourceCard = ({ source }) => {
  if (!source) return null;

  const { fileName, chunkIndex, excerpt, relevanceScore } = source;

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <FileText size={13} />
          {fileName} — excerpt {chunkIndex + 1}
        </div>
        {typeof relevanceScore === 'number' && (
          <span className="text-[11px] font-medium text-medical-600 bg-medical-50 px-2 py-0.5 rounded-full">
            {(relevanceScore * 100).toFixed(0)}% match
          </span>
        )}
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{excerpt}</p>
    </div>
  );
};

export default PdfSourceCard;