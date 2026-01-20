// =============================================
// Question Card Component
// =============================================
// Displays a single quiz question with options

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Question } from '@/lib/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  showResult?: boolean;
  disabled?: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showResult = false,
  disabled = false,
}: QuestionCardProps) {
  const [inputValue, setInputValue] = useState(selectedAnswer || '');

  // Check if answer is correct (for showing results)
  const isCorrect = selectedAnswer?.toLowerCase().trim() === 
                    question.correct_answer.toLowerCase().trim();

  // Handle identification type input
  const handleInputChange = (value: string) => {
    setInputValue(value);
    onAnswerSelect(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      {/* Question number and type badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span
          className={cn(
            'px-3 py-1 text-xs font-medium rounded-full',
            question.type === 'multiple_choice' && 'bg-blue-100 text-blue-700',
            question.type === 'identification' && 'bg-green-100 text-green-700',
            question.type === 'true_false' && 'bg-purple-100 text-purple-700'
          )}
        >
          {question.type === 'multiple_choice' && '🎯 Multiple Choice'}
          {question.type === 'identification' && '✍️ Identification'}
          {question.type === 'true_false' && '⚖️ True or False'}
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {question.question_text}
      </h2>

      {/* Answer options based on question type */}
      {question.type === 'identification' ? (
        // Text input for identification questions
        <div className="space-y-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={disabled}
            placeholder="Type your answer here..."
            className={cn(
              'w-full px-4 py-3 rounded-xl border-2 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              disabled ? 'bg-gray-50' : 'bg-white',
              showResult && isCorrect && 'border-green-500 bg-green-50',
              showResult && !isCorrect && selectedAnswer && 'border-red-500 bg-red-50',
              !showResult && 'border-gray-200 focus:border-primary'
            )}
          />
          
          {/* Show correct answer when result is displayed */}
          {showResult && !isCorrect && selectedAnswer && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-700">
                <strong>Correct answer:</strong> {question.correct_answer}
              </p>
            </div>
          )}
        </div>
      ) : (
        // Option buttons for multiple choice and true/false
        <div className="space-y-3">
          {question.options?.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === question.correct_answer;
            
            return (
              <button
                key={index}
                onClick={() => !disabled && onAnswerSelect(option)}
                disabled={disabled}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border-2 text-left transition-all',
                  'flex items-center gap-3',
                  disabled ? 'cursor-default' : 'cursor-pointer hover:border-primary',
                  // Default state
                  !isSelected && !showResult && 'border-gray-200 bg-white',
                  // Selected state (before results)
                  isSelected && !showResult && 'border-primary bg-primary/5',
                  // Correct answer (showing results)
                  showResult && isCorrectOption && 'border-green-500 bg-green-50',
                  // Wrong answer selected (showing results)
                  showResult && isSelected && !isCorrectOption && 'border-red-500 bg-red-50'
                )}
              >
                {/* Option letter */}
                <span
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    !isSelected && !showResult && 'bg-gray-100 text-gray-600',
                    isSelected && !showResult && 'bg-primary text-white',
                    showResult && isCorrectOption && 'bg-green-500 text-white',
                    showResult && isSelected && !isCorrectOption && 'bg-red-500 text-white'
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                
                {/* Option text */}
                <span className="flex-1 text-gray-700">{option}</span>
                
                {/* Result indicator */}
                {showResult && isCorrectOption && (
                  <span className="text-green-600">✓</span>
                )}
                {showResult && isSelected && !isCorrectOption && (
                  <span className="text-red-600">✗</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Explanation (shown after results) */}
      {showResult && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm font-medium text-blue-800 mb-1">💡 Explanation</p>
          <p className="text-sm text-blue-700">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
