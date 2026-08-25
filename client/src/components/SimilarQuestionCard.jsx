import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import QuestionMetadata from './QuestionMetadata.jsx';

export const SimilarQuestionCard = ({ item }) => {
  const { similarityScore, question } = item;
  if (!question) return null;

  const { _id, questionText, university, year, subject, chapter, topic, questionType } = question;

  // Format score as percentage
  const percentageScore = Math.round(similarityScore * 100);

  return (
    <div className="bg-white border border-slate-200 hover:border-medical-300 rounded-2xl p-5 transition duration-150 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-3 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Similarity score chip */}
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-medical-700 bg-medical-50 border border-medical-100 rounded-full px-2.5 py-0.5">
            <Sparkles size={10} className="fill-medical-700 text-medical-700" />
            {percentageScore}% match
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Semantic Relevance</span>
        </div>

        <h4 className="text-slate-900 font-bold text-sm sm:text-base leading-snug line-clamp-2">
          {questionText}
        </h4>

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
          className="inline-flex items-center gap-1 px-3 py-1.5 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition"
        >
          Study Hub
          <ArrowUpRight size={14} className="text-slate-400" />
        </Link>
      </div>
    </div>
  );
};

export default SimilarQuestionCard;
