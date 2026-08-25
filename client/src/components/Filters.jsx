import React from 'react';
import { Filter, X } from 'lucide-react';

export const Filters = ({ filters = {}, activeFilters = {}, onChange, onClear }) => {
  const { subjects = [], universities = [], years = [] } = filters;

  const hasActiveFilters = Object.values(activeFilters).some(value => !!value);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-premium max-w-3xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Filter size={14} className="text-slate-400" />
          Filter Questions
        </h4>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition"
          >
            <X size={12} />
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Subject Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Subject</label>
          <select
            value={activeFilters.subject || ''}
            onChange={(e) => onChange('subject', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-medical-500 outline-none transition"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* University Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">University</label>
          <select
            value={activeFilters.university || ''}
            onChange={(e) => onChange('university', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-medical-500 outline-none transition"
          >
            <option value="">All Universities</option>
            {universities.map((uni) => (
              <option key={uni} value={uni}>
                {uni}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Year</label>
          <select
            value={activeFilters.year || ''}
            onChange={(e) => onChange('year', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-medical-500 outline-none transition"
          >
            <option value="">All Years</option>
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
