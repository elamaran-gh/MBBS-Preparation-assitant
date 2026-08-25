import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import QuestionMetadata from './QuestionMetadata.jsx';

export const QuestionCard = ({ question }) => {
  const { _id, questionText, university, year, subject, chapter, topic, questionType } = question;

  return (
    <div className="bg-white border border-slate-200 hover:border-medical-300 rounded-2xl p-5 transition duration-200 shadow-premium group flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-2">
          {/* Subtle subject indicator bar */}
          <span className="w-1.5 h-6 bg-slate-200 group-hover:bg-medical-500 rounded-full transition-colors duration-200"></span>
          <h3 className="text-slate-900 font-bold text-sm sm:text-base leading-snug line-clamp-2 pr-4">
            {questionText}
          </h3>
        </div>

        <QuestionMetadata
          university={university}
          year={year}
          subject={subject}
          chapter={chapter}
          topic={topic}
          questionType={questionType}
        />
      </div>

      <div className="flex md:self-stretch items-end md:items-center justify-end border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
        <Link
          to={`/question/${_id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 hover:bg-medical-50 border border-transparent hover:border-medical-100 hover:text-medical-700 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition duration-150"
        >
          View Exam Hub
          <ChevronRight size={16} className="text-slate-400 group-hover:text-medical-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
};

export default QuestionCard;
