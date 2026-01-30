// =============================================
// Quiz Page
// =============================================
// Take a quiz - answer questions one by one

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Question, QuizWithQuestions } from '@/lib/types';
import { APP_CONTENT } from '@/config/content';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  // State
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const currentQuestion: Question | undefined = quiz?.questions[currentIndex];
  const totalQuestions = quiz?.questions.length || 0;
  const answeredCount = Object.keys(answers).length;

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Submit quiz
  const handleSubmit = async () => {
    if (!quiz) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const response = await fetch(`/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          timeSpent,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit quiz');
      }

      // Navigate to results page
      router.push(`/results/${quizId}?attemptId=${data.attemptId}`);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner text="Loading quiz..." />
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Quiz title */}
      <div className="text-center mb-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
      </div>

      {/* Progress bar */}
      <div className="mb-6 animate-fadeIn">
        <ProgressBar current={answeredCount} total={totalQuestions} />
      </div>

      {/* Question card */}
      <div className="mb-6 animate-slideUp">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          selectedAnswer={answers[currentQuestion.id] || null}
          onAnswerSelect={handleAnswerSelect}
          quizId={quizId}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center animate-slideUp">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          ← {APP_CONTENT.buttons.previousQuestion}
        </Button>

        {currentIndex === totalQuestions - 1 ? (
          // Submit button on last question
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={answeredCount < totalQuestions}
          >
            {APP_CONTENT.buttons.submit}
          </Button>
        ) : (
          // Next button
          <Button onClick={handleNext}>
            {APP_CONTENT.buttons.nextQuestion} →
          </Button>
        )}
      </div>

      {/* Question dots navigation */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {quiz.questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(index)}
            className={`
              w-8 h-8 rounded-full text-sm font-medium transition-all
              ${
                index === currentIndex
                  ? 'bg-primary text-white'
                  : answers[q.id]
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }
            `}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Unanswered warning */}
      {answeredCount < totalQuestions && (
        <p className="text-center text-sm text-gray-500 mt-4">
          {totalQuestions - answeredCount} question(s) unanswered
        </p>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
