import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import SearchResults from './pages/SearchResults.jsx';
import QuestionDetail from './pages/QuestionDetail.jsx';
import AIAnswer from './pages/AIAnswer.jsx';
import SimilarQuestions from './pages/SimilarQuestions.jsx';
import TextbookReference from './pages/TextbookReference.jsx';
import StudyFromPDF from './pages/StudyFromPDF.jsx';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Navigation Header */}
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/question/:id" element={<QuestionDetail />} />
            <Route path="/question/:id/answer" element={<AIAnswer />} />
            <Route path="/question/:id/similar" element={<SimilarQuestions />} />
            <Route path="/reference/:id" element={<TextbookReference />} />
            <Route path="/study-from-pdf" element={<StudyFromPDF />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-slate-200/80 py-6 mt-12 text-center text-xs text-slate-500 font-medium">
          <div className="max-w-7xl mx-auto px-4">
            MBBS AI Study Assistant — A Portfolio Proof-of-Concept for Medical Syllabus-Oriented RAG.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
