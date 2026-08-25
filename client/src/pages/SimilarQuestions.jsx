import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import SimilarQuestionCard from '../components/SimilarQuestionCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { ArrowLeft, Layers } from 'lucide-react';

export const SimilarQuestions = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSimilarQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch base question
      const qRes = await api.getQuestionById(id);
      if (qRes.success) {
        setQuestion(qRes.data);
      }

      // Fetch similar questions
      const simRes = await api.getSimilarQuestions(id);
      if (simRes.success) {
        setSimilarItems(simRes.data);
      }
    } catch (err) {
      setError('Failed to compute similarity scores from vector databases. Make sure seed data exists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSimilarQuestions();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <div className="flex items-center">
        <Link
          to={`/question/${id}`}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-semibold text-xs sm:text-sm transition"
        >
          <ArrowLeft size={16} />
          Back to Question
        </Link>
      </div>

      {/* Origin Question */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-premium">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Source Question
        </span>
        <h2 className="text-slate-900 font-extrabold text-sm sm:text-base leading-snug">
          {question?.questionText}
        </h2>
      </div>

      {/* List Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
        <Layers size={16} className="text-slate-400" />
        <h3 className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight">
          Semantically Similar Questions
        </h3>
        <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/50">
          {similarItems.length} matches
        </span>
      </div>

      {/* List Display */}
      {loading ? (
        <LoadingState message="Calculating similarity indexes from vector embeddings..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadSimilarQuestions} />
      ) : similarItems.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs sm:text-sm">
          No other similar questions were found in the database.
        </div>
      ) : (
        <div className="space-y-4">
          {similarItems.map((item, idx) => (
            <SimilarQuestionCard key={item.question?._id || idx} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SimilarQuestions;
