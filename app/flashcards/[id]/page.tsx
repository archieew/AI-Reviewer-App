// =============================================
// Flashcard Mode Page
// =============================================
// Study questions in flashcard format

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { QuizWithQuestions, Question } from '@/lib/types';
import { APP_CONTENT } from '@/config/content';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function FlashcardPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  // State
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [needsPractice, setNeedsPractice] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quiz/${quizId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load quiz');
        }

        setQuiz(data.quiz);
        // Shuffle questions for flashcard mode
        const shuffled = [...data.quiz.questions].sort(() => Math.random() - 0.5);
        setShuffledQuestions(shuffled);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Get current question
  const currentQuestion = shuffledQuestions[currentIndex];
  const totalQuestions = shuffledQuestions.length;

  // Handle card flip
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Mark as known
  const handleMarkKnown = () => {
    if (currentQuestion) {
      setKnownCards((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentQuestion.id);
        return newSet;
      });
      handleNext();
    }
  };

  // Mark as needs practice
  const handleMarkNeedsPractice = () => {
    if (currentQuestion) {
      setNeedsPractice((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentQuestion.id);
        return newSet;
      });
      handleNext();
    }
  };

  // Navigate to next card
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  // Navigate to previous card
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  // Reset flashcards
  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setNeedsPractice(new Set());
    // Reshuffle
    const shuffled = [...(quiz?.questions || [])].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner text="Loading flashcards..." />
      </div>
    );
  }

  // Error state
  if (error || !quiz || !currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-red-600 mb-4">{error || 'Quiz not found'}</p>
          <Button onClick={() => router.push('/')}>
            {APP_CONTENT.buttons.backToHome}
          </Button>
        </div>
      </div>
    );
  }

  const isKnown = knownCards.has(currentQuestion.id);
  const needsPracticeCard = needsPractice.has(currentQuestion.id);
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
        <p className="text-gray-600">Flashcard Mode</p>
        <div className="mt-2 text-sm text-gray-500">
          Card {currentIndex + 1} of {totalQuestions}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-6 animate-slideUp">
        <div
          className="relative bg-white rounded-3xl shadow-xl p-8 md:p-12 min-h-[400px] flex items-center justify-center cursor-pointer transform transition-transform hover:scale-[1.02]"
          onClick={handleFlip}
        >
          {/* Card content */}
          <div className="text-center w-full">
            {!isFlipped ? (
              // Front of card (question)
              <div>
                <div className="text-sm text-gray-500 mb-4">Question</div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
                  {currentQuestion.question_text}
                </h2>
                {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                  <div className="mt-6 space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-400 mt-8">Click to reveal answer</p>
              </div>
            ) : (
              // Back of card (answer)
              <div>
                <div className="text-sm text-gray-500 mb-4">Answer</div>
                <h3 className="text-2xl md:text-3xl font-bold text-primary mb-6">
                  {currentQuestion.correct_answer}
                </h3>
                {currentQuestion.explanation && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm font-medium text-blue-800 mb-1">💡 Explanation</p>
                    <p className="text-sm text-blue-700">{currentQuestion.explanation}</p>
                  </div>
                )}
                <p className="text-sm text-gray-400 mt-8">Click to see question</p>
              </div>
            )}
          </div>

          {/* Status badges */}
          <div className="absolute top-4 right-4 flex gap-2">
            {isKnown && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                ✓ Known
              </span>
            )}
            {needsPracticeCard && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                📚 Practice
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          ← Previous
        </Button>
        <Button onClick={handleFlip}>
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </Button>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === totalQuestions - 1}
        >
          Next →
        </Button>
      </div>

      {/* Mark buttons (only shown when flipped) */}
      {isFlipped && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Button
            variant="outline"
            onClick={handleMarkKnown}
            className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
          >
            ✓ I Know This
          </Button>
          <Button
            variant="outline"
            onClick={handleMarkNeedsPractice}
            className="bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            📚 Needs Practice
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{knownCards.size}</div>
            <div className="text-xs text-gray-600">Known</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{needsPractice.size}</div>
            <div className="text-xs text-gray-600">Need Practice</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-700">
              {totalQuestions - knownCards.size - needsPractice.size}
            </div>
            <div className="text-xs text-gray-600">Remaining</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" onClick={handleReset}>
          🔄 Reset & Reshuffle
        </Button>
        <Link href={`/quiz/${quizId}`}>
          <Button variant="outline">Take Full Quiz</Button>
        </Link>
        <Link href="/history">
          <Button variant="outline">Back to History</Button>
        </Link>
      </div>
    </div>
  );
}
