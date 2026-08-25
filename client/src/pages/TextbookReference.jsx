import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { ArrowLeft, Book, Bookmark, MapPin } from 'lucide-react';

export const TextbookReference = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reference, setReference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReference = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getReferenceById(id);
      if (res.success) {
        setReference(res.data);
      }
    } catch (err) {
      setError('Could not locate reference textbook page. Verify databases are populated.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReference();
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12"><LoadingState message="Retrieving reference source text..." /></div>;
  if (error || !reference) return <div className="max-w-3xl mx-auto px-4 py-12"><ErrorState message={error || 'Reference not found'} onRetry={loadReference} /></div>;

  const { bookName, chapter, topic, content, pageNumber, source } = reference;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation */}
      <div className="flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-semibold text-xs sm:text-sm transition"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>

      {/* Excerpt Details */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-premium space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-800">
              <Book size={20} className="text-medical-600" />
              <h1 className="font-extrabold text-base sm:text-lg">
                {bookName}
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Syllabus Reference Library {source ? `• ${source}` : ''}
            </p>
          </div>
          {pageNumber && (
            <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
              <MapPin size={12} />
              Page {pageNumber}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 bg-medical-50 text-medical-700 border border-medical-100 rounded-lg font-semibold uppercase tracking-wider text-[10px]">
              Chapter: {chapter}
            </span>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg font-semibold uppercase tracking-wider text-[10px]">
              Topic: {topic}
            </span>
          </div>
        </div>

        <div className="border-l-4 border-medical-500 bg-slate-50 p-5 rounded-r-2xl">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Bookmark size={12} />
            Verified Content Segment
          </h3>
          <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextbookReference;
