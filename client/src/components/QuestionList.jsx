import React from 'react';
import QuestionCard from './QuestionCard.jsx';
import EmptyState from './EmptyState.jsx';

export const QuestionList = ({ questions = [] }) => {
  if (questions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard key={question._id} question={question} />
      ))}
    </div>
  );
};

export default QuestionList;
