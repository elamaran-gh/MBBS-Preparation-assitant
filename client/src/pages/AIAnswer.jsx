import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import AnswerSection from '../components/AnswerSection.jsx';
import ReferenceCard from '../components/ReferenceCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { ArrowLeft, Sparkles, BookOpen } from 'lucide-react';

export const AIAnswer = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answerData, setAnswerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnswer = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get the question text for displaying on top
      const qRes = await api.getQuestionById(id);
      if (qRes.success) {
        setQuestion(qRes.data);
      }

      // Then request RAG generation
      const answerRes = await api.generateAIAnswer(id);
      if (answerRes.success) {
        setAnswerData(answerRes.data);
      }
    } catch (err) {
      console.error(err);
      setError('The AI answer generator failed to compile the response. Please check backend environment configuration keys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnswer();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <LoadingState message="RAG: Fetching textbook context and asking LLM to compile answers..." />
      </div>
    );
  }

  if (error || !answerData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="flex items-center mb-6">
          <Link to={`/question/${id}`} className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-semibold text-xs sm:text-sm">
            <ArrowLeft size={16} />
            Back to Question
          </Link>
        </div>
        <ErrorState message={error || 'Could not compile answer'} onRetry={loadAnswer} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8">
      {/* Navigation and Title */}
      <div className="flex items-center justify-between">
        <Link
          to={`/question/${id}`}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-semibold text-xs sm:text-sm transition"
        >
          <ArrowLeft size={16} />
          Back to Question
        </Link>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
          <Sparkles size={12} className="fill-emerald-600 stroke-none" />
          RAG Pipeline Complete
        </span>
      </div>

      {/* Embedded Question box */}
      <div className="bg-slate-100 border border-slate-200/80 rounded-2xl p-5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Target Question
        </span>
        <h2 className="text-slate-900 font-extrabold text-sm sm:text-base leading-snug">
          {question?.questionText || 'MBBS Exam Question'}
        </h2>
      </div>

      {/* Formatted Answer Sections */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          AI Generated Syllabus Answer
        </h3>
        <AnswerSection answerData={answerData.answer} />
      </div>

      {/* Retrieved reference sources */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <BookOpen size={16} className="text-slate-400" />
          <h3 className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight">
            Retrieved Reference Excerpts
          </h3>
          <span className="text-xs text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/50">
            {answerData.sources?.length || 0} sourced
          </span>
        </div>
        
        {(!answerData.sources || answerData.sources.length === 0) ? (
          <p className="text-slate-500 text-xs italic">No references retrieved for context validation.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {answerData.sources.map((src, i) => (
              <ReferenceCard key={src._id || i} reference={src} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnswer;
