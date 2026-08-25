import React from 'react';
import { BookOpen, Stethoscope, Landmark, ShieldAlert, Compass, ClipboardList } from 'lucide-react';

export const AnswerSection = ({ answerData }) => {
  if (!answerData) return null;

  const { definition, mainPoints = [], clinicalFeatures = [], investigations = [], management = [], importantExamPoints = [] } = answerData;

  const sections = [
    {
      title: 'Definition & Overview',
      icon: <BookOpen size={18} className="text-blue-600" />,
      bg: 'bg-blue-50/40 border-blue-100',
      content: <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">{definition}</p>
    },
    {
      title: 'Pathophysiological Core Points',
      icon: <Compass size={18} className="text-indigo-600" />,
      bg: 'bg-indigo-50/40 border-indigo-100',
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm leading-relaxed">
          {mainPoints.map((point, i) => <li key={i}>{point}</li>)}
        </ul>
      )
    },
    {
      title: 'Clinical Presentation',
      icon: <Stethoscope size={18} className="text-orange-600" />,
      bg: 'bg-orange-50/40 border-orange-100',
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm leading-relaxed">
          {clinicalFeatures.map((feat, i) => <li key={i}>{feat}</li>)}
        </ul>
      )
    },
    {
      title: 'Diagnostic Investigations',
      icon: <ClipboardList size={18} className="text-purple-600" />,
      bg: 'bg-purple-50/40 border-purple-100',
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm leading-relaxed">
          {investigations.map((inv, i) => <li key={i}>{inv}</li>)}
        </ul>
      )
    },
    {
      title: 'Treatment & Management Protocols',
      icon: <Landmark size={18} className="text-emerald-600" />,
      bg: 'bg-emerald-50/40 border-emerald-100',
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm leading-relaxed">
          {management.map((mgt, i) => <li key={i}>{mgt}</li>)}
        </ul>
      )
    },
    {
      title: 'Important Exam High-Yield Points',
      icon: <ShieldAlert size={18} className="text-rose-600 animate-pulse" />,
      bg: 'bg-rose-50 border-rose-100/60 shadow-sm',
      content: (
        <ul className="list-disc pl-5 space-y-2 text-rose-900 text-sm font-medium leading-relaxed">
          {importantExamPoints.map((pt, i) => <li key={i}>{pt}</li>)}
        </ul>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {sections.map((section, idx) => {
        // Skip sections that are empty
        const listLength = Array.isArray(section.content.props.children) ? section.content.props.children.length : 1;
        if (!section.content || listLength === 0) return null;

        return (
          <div
            key={idx}
            className={`border rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-premium ${section.bg}`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span className="p-1.5 bg-white rounded-lg border border-slate-200/40 shadow-sm">
                {section.icon}
              </span>
              <h3 className="text-slate-900 font-bold text-sm sm:text-base tracking-tight">
                {section.title}
              </h3>
            </div>
            <div className="border-t border-slate-200/40 pt-3">
              {section.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnswerSection;
