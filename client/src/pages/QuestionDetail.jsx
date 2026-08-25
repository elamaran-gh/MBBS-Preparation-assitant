import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import QuestionMetadata from '../components/QuestionMetadata.jsx';
import ReferenceCard from '../components/ReferenceCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { ArrowLeft, Sparkles, BookOpen, Layers } from 'lucide-react';

export const QuestionDetail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getQuestionById(id);
      if (res.success) {
        setQuestion(res.data);
      }
    } catch (err) {
      setError('Could not locate the selected question in the database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12"><LoadingState message="Fetching question detail..." /></div>;
  if (error || !question) return <div className="max-w-3xl mx-auto px-4 py-12"><ErrorState message={error || 'Question not found'} onRetry={loadQuestion} /></div>;

  const { questionText, university, year, subject, chapter, topic, questionType, referenceIds = [] } = question;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <div className="flex items-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-semibold text-xs sm:text-sm transition"
        >
          <ArrowLeft size={16} />
          Back to Question Bank
        </Link>
      </div>

      {/* Main Question Display */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-premium space-y-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-medical-500/5 rounded-full blur-2xl"></div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-7 bg-medical-600 rounded-full"></span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Hub</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-snug">
            {questionText}
          </h1>

          <QuestionMetadata
            university={university}
            year={year}
            subject={subject}
            chapter={chapter}
            topic={topic}
            questionType={questionType}
          />
        </div>
      </div>

      {/* RAG Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Action 1: Generate AI Answer */}
        <Link
          to={`/question/${id}/answer`}
          className="flex items-center justify-between p-5 bg-gradient-to-r from-medical-600 to-indigo-600 hover:from-medical-700 hover:to-indigo-755 text-white rounded-2xl transition duration-200 shadow-md group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="space-y-1 z-10">
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
              <Sparkles size={16} className="fill-white" />
              Generate AI Answer
            </h3>
            <p className="text-white/80 text-xs font-medium">Syllabus structured medical notes</p>
          </div>
          <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm z-10 group-hover:translate-x-1 transition-transform">
            &rarr;
          </span>
        </Link>

        {/* Action 2: Find Similar Questions */}
        <Link
          to={`/question/${id}/similar`}
          className="flex items-center justify-between p-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-900 rounded-2xl transition duration-200 shadow-premium group"
        >
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
              <Layers size={16} className="text-medical-600" />
              Similar Questions
            </h3>
            <p className="text-slate-500 text-xs font-medium">Verify related syllabus trends</p>
          </div>
          <span className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
            &rarr;
          </span>
        </Link>
      </div>

      {/* Linked Reference Textbook Sources */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <BookOpen size={16} className="text-slate-400" />
          <h2 className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight">
            Connected Reference Material
          </h2>
          <span className="text-xs text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/50">
            {referenceIds.length} sources
          </span>
        </div>

        {referenceIds.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 text-center text-slate-500 text-xs sm:text-sm">
            No specific textbook excerpts are manually linked to this question yet. Trigger the AI Answer to search semantically.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {referenceIds.map((ref) => (
              <ReferenceCard key={ref._id || ref} reference={ref} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;
