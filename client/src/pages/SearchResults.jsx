import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import SearchBar from '../components/SearchBar.jsx';
import QuestionList from '../components/QuestionList.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { ArrowLeft, Inbox } from 'lucide-react';

export const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const query = searchParams.get('q') || '';
  const subject = searchParams.get('subject') || '';
  const university = searchParams.get('university') || '';
  const year = searchParams.get('year') || '';

  const runSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.searchQuestions({ q: query, subject, university, year });
      if (res.success) {
        setQuestions(res.data);
      }
    } catch (err) {
      setError('An error occurred while communicating with the database search service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch();
  }, [searchParams]);

  const handleSearchSubmit = (newQuery) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newQuery) {
      nextParams.set('q', newQuery);
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button link */}
      <div className="flex items-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-semibold text-xs sm:text-sm transition"
        >
          <ArrowLeft size={16} />
          Back to Question Bank
        </Link>
      </div>

      {/* Embedded Search bar */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-premium">
        <SearchBar onSearch={handleSearchSubmit} initialValue={query} />
      </div>

      {/* Query summary */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <h2 className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight">
          {query ? `Search Results for "${query}"` : 'Filtered Question Bank'}
        </h2>
        <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/50">
          {questions.length} {questions.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      {/* Display List */}
      {loading ? (
        <LoadingState message="Searching database archives..." />
      ) : error ? (
        <ErrorState message={error} onRetry={runSearch} />
      ) : questions.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-premium">
          <Inbox size={32} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matches found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            We couldn't find any questions matching your filters or search terms. Double check spelling or clear filters.
          </p>
        </div>
      ) : (
        <QuestionList questions={questions} />
      )}
    </div>
  );
};

export default SearchResults;
