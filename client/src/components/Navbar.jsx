import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BookOpen, GraduationCap, Sparkles, FileText } from 'lucide-react';

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 glassmorphism shadow-premium border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-medical-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-medical-200 transition duration-300 group-hover:scale-105">
              <GraduationCap size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-none">
                MBBS <span className="text-medical-600">AI</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
                Study Assistant
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium transition duration-200 ${
                  isActive
                    ? 'text-medical-600 border-b-2 border-medical-600 py-1.5'
                    : 'text-slate-600 hover:text-slate-950 py-1.5'
                }`
              }
            >
              Question Bank
            </NavLink>
            <NavLink
              to="/study-from-pdf"
              className={({ isActive }) =>
                `flex items-center gap-1.5 text-sm font-medium transition duration-200 ${
                  isActive
                    ? 'text-medical-600 border-b-2 border-medical-600 py-1.5'
                    : 'text-slate-600 hover:text-slate-950 py-1.5'
                }`
              }
            >
              <FileText size={15} />
              Study from PDF
            </NavLink>
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
              <Sparkles size={11} className="fill-emerald-700" />
              Syllabus-Aligned RAG
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;