import React from 'react';
import { BookOpen, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReferenceCard = ({ reference }) => {
  const { _id, bookName, chapter, topic, content, pageNumber, source } = reference;

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-slate-300 transition duration-150 flex flex-col justify-between gap-4">
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-slate-500" />
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
              {bookName}
            </h4>
          </div>
          {pageNumber && (
            <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-200/60 rounded px-1.5 py-0.5">
              <MapPin size={10} />
              Page {pageNumber}
            </span>
          )}
        </div>
        <p className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
          Chapter: {chapter} • Topic: {topic} {source ? `(${source})` : ''}
        </p>
        <blockquote className="border-l-2 border-slate-300 pl-3 text-slate-600 text-xs sm:text-sm leading-relaxed italic line-clamp-3">
          "{content}"
        </blockquote>
      </div>

      <div className="border-t border-slate-200/60 pt-3 flex justify-end">
        <Link
          to={`/reference/${_id}`}
          className="text-xs font-semibold text-medical-600 hover:text-medical-700 transition"
        >
          View Full Excerpt &rarr;
        </Link>
      </div>
    </div>
  );
};

export default ReferenceCard;
