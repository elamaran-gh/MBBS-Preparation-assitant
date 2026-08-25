import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const SearchBar = ({ onSearch, placeholder = 'Search previous years questions (e.g. appendicitis)...', initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-28 py-3.5 bg-white border border-slate-200 focus:border-medical-500 focus:ring-2 focus:ring-medical-100 rounded-2xl text-slate-900 placeholder-slate-400 outline-none transition duration-200 text-sm sm:text-base shadow-premium"
        />
        <button
          type="submit"
          className="absolute right-2 px-5 py-2 bg-medical-600 hover:bg-medical-700 active:bg-medical-800 text-white font-medium text-xs sm:text-sm rounded-xl transition duration-200 shadow-sm"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
