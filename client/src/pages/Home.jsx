import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import SearchBar from '../components/SearchBar.jsx';
import Filters from '../components/Filters.jsx';
import QuestionList from '../components/QuestionList.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { Sparkles, BookOpen, Clock } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [filterLists, setFilterLists] = useState({ subjects: [], universities: [], years: [] });
  const [activeFilters, setActiveFilters] = useState({ subject: '', university: '', year: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch questions based on active filters
      const res = await api.getQuestions(activeFilters);
      if (res.success) {
        setQuestions(res.data);
        setFilterLists(res.filters);
      }
    } catch (err) {
      setError('Could not establish contact with backend database. Please ensure MongoDB and the Express server are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFilters]);

  const handleSearch = (query) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (activeFilters.subject) params.append('subject', activeFilters.subject);
    if (activeFilters.university) params.append('university', activeFilters.university);
    if (activeFilters.year) params.append('year', activeFilters.year);
    
    navigate(`/search?${params.toString()}`);
  };

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setActiveFilters({ subject: '', university: '', year: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
      {/* Brand Hero Panel */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-medical-50 border border-medical-100 rounded-full text-xs font-bold text-medical-700 shadow-sm">
          <Sparkles size={12} className="text-medical-600 fill-medical-500" />
          University Exam RAG Preparation Platform
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
          Master Your MBBS Exams <br className="hidden sm:inline" />
          With <span className="bg-gradient-to-r from-medical-600 to-indigo-600 bg-clip-text text-transparent">Syllabus-Aligned AI</span>
        </h1>
        <p className="text-slate-500 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Retrieve reference textbook context from Robbins, Bailey & Love, and Harrison. Generate structured, exam-ready definitions, clinical signs, and management protocols.
        </p>
      </div>

      {/* Search and Filters Hub */}
      <div className="space-y-4">
        <SearchBar onSearch={handleSearch} />
        <Filters
          filters={filterLists}
          activeFilters={activeFilters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />
      </div>

      {/* Main List Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Clock size={16} className="text-slate-400" />
          <h2 className="text-slate-900 font-extrabold text-base tracking-tight">
            Featured Question Bank
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            ({questions.length} loaded)
          </span>
        </div>

        {loading ? (
          <LoadingState message="Connecting to study bank..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : (
          <QuestionList questions={questions} />
        )}
      </div>
    </div>
  );
};

export default Home;
