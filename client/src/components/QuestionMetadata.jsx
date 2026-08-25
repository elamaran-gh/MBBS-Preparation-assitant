import React from 'react';
import { Book, Calendar, Award, Hash, Bookmark } from 'lucide-react';

export const QuestionMetadata = ({ university, year, subject, chapter, topic, questionType }) => {
  // Theme color maps for subjects
  const subjectColors = {
    Medicine: 'bg-blue-50 text-blue-700 border-blue-100',
    Surgery: 'bg-orange-50 text-orange-700 border-orange-100',
    Pathology: 'bg-purple-50 text-purple-700 border-purple-100',
    Pharmacology: 'bg-emerald-50 text-emerald-700 border-emerald-100'
  };

  const currentSubjectColor = subjectColors[subject] || 'bg-slate-50 text-slate-700 border-slate-100';

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {/* Subject */}
      {subject && (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold ${currentSubjectColor}`}>
          <Book size={12} />
          {subject}
        </span>
      )}

      {/* University */}
      {university && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200/60 rounded-lg font-medium">
          <Award size={12} className="text-slate-500" />
          {university}
        </span>
      )}

      {/* Year */}
      {year && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200/60 rounded-lg font-medium">
          <Calendar size={12} className="text-slate-500" />
          {year}
        </span>
      )}

      {/* Question Type */}
      {questionType && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-medical-50 text-medical-700 border border-medical-100 rounded-lg font-medium">
          <Bookmark size={12} />
          {questionType}
        </span>
      )}

      {/* Chapter / Topic */}
      {(chapter || topic) && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-100 rounded-lg font-normal">
          <Hash size={12} className="text-slate-400" />
          {chapter ? `${chapter} • ` : ''}{topic}
        </span>
      )}
    </div>
  );
};

export default QuestionMetadata;
