// =============================================
// Question Card Component
// =============================================
// Displays a single quiz question with options

'use client';

import { useState, useEffect } from 'react';
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
  quizId?: string; // Required for bookmark and notes features
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showResult = false,
  disabled = false,
  quizId,
}: QuestionCardProps) {
  const [inputValue, setInputValue] = useState(selectedAnswer || '');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [hasNote, setHasNote] = useState(false);

  // Check if answer is correct (for showing results)
  const isCorrect = selectedAnswer?.toLowerCase().trim() === 
                    question.correct_answer.toLowerCase().trim();

  // Check bookmark status on mount
  useEffect(() => {
    if (quizId && question.id) {
      checkBookmarkStatus();
      loadStudyNote();
    }
  }, [quizId, question.id]);

  // Check if question is bookmarked
  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch(`/api/bookmarks/check?questionId=${question.id}`);
      const data = await response.json();
      if (data.success) {
        setIsBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  // Load study note
  const loadStudyNote = async () => {
    try {
      const response = await fetch(`/api/notes?questionId=${question.id}`);
      const data = await response.json();
      if (data.success && data.note) {
        setNoteText(data.note.note_text);
        setHasNote(true);
      }
    } catch (error) {
      console.error('Error loading study note:', error);
    }
  };

  // Toggle bookmark
  const handleToggleBookmark = async () => {
    if (!quizId) return;
    
    setIsBookmarking(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks?questionId=${question.id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          setIsBookmarked(false);
        }
      } else {
        // Add bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId: question.id, quizId }),
        });
        const data = await response.json();
        if (data.success) {
          setIsBookmarked(true);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  // Save study note
  const handleSaveNote = async () => {
    if (!quizId) return;
    
    setIsSavingNote(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          quizId,
          noteText: noteText.trim(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setHasNote(true);
        setShowNotes(false);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Delete study note
  const handleDeleteNote = async () => {
    try {
      const response = await fetch(`/api/notes?questionId=${question.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setNoteText('');
        setHasNote(false);
        setShowNotes(false);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

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
        <div className="flex items-center gap-2">
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
          
          {/* Bookmark button */}
          {quizId && (
            <button
              onClick={handleToggleBookmark}
              disabled={isBookmarking}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isBookmarked
                  ? 'text-yellow-500 hover:bg-yellow-50'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-yellow-500'
              )}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark this question'}
            >
              {isBookmarked ? '⭐' : '☆'}
            </button>
          )}
        </div>
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

      {/* Study Notes Section */}
      {quizId && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          {/* Toggle button */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors mb-4"
          >
            <span className="text-lg">{showNotes ? '📝' : '📄'}</span>
            <span>
              {hasNote ? 'Edit Study Note' : 'Add Study Note'}
            </span>
            {hasNote && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                Has note
              </span>
            )}
          </button>

          {/* Notes editor */}
          {showNotes && (
            <div className="mt-4 p-5 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl border-2 border-primary/20 shadow-sm">
              {/* Textarea */}
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add your personal notes, reminders, or study tips here..."
                className={cn(
                  'w-full px-4 py-3 rounded-xl border-2 transition-all resize-none',
                  'bg-white text-gray-900 placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                  'border-gray-300'
                )}
                rows={5}
              />

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={handleSaveNote}
                  disabled={isSavingNote || !noteText.trim()}
                  className={cn(
                    'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                    'bg-primary text-white shadow-sm',
                    'hover:bg-primary-dark hover:shadow-md',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary',
                    'flex items-center gap-2'
                  )}
                >
                  {isSavingNote ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save Note</span>
                    </>
                  )}
                </button>
                {hasNote && (
                  <button
                    onClick={handleDeleteNote}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
                  >
                    🗑️ Delete
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowNotes(false);
                    loadStudyNote(); // Reload to reset if cancelled
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors border border-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Display saved note */}
          {hasNote && !showNotes && (
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">📌</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-yellow-900">Your Study Note</h4>
                    <span className="px-2 py-0.5 text-xs font-medium bg-yellow-200 text-yellow-800 rounded-full">
                      Saved
                    </span>
                  </div>
                  <p className="text-sm text-yellow-800 leading-relaxed whitespace-pre-wrap">
                    {noteText}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
