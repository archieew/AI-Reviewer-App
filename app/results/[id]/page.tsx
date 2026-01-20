// =============================================
// Results Page
// =============================================
// Display quiz results and review answers

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { QuizWithQuestions, Attempt } from '@/lib/types';
import { APP_CONTENT } from '@/config/content';
import { formatDuration, formatPercentage, getScoreColor } from '@/lib/utils';
import QuestionCard from '@/components/QuestionCard';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const quizId = params.id as string;
  const attemptId = searchParams.get('attemptId');

  // State
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  // Fetch results data
  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Fetch quiz with questions
        const quizResponse = await fetch(`/api/quiz/${quizId}`);
        const quizData = await quizResponse.json();

        if (!quizResponse.ok || !quizData.success) {
          throw new Error(quizData.error || 'Failed to load quiz');
        }

        setQuiz(quizData.quiz);

        // Fetch attempt if attemptId is provided
        if (attemptId) {
          const attemptResponse = await fetch(`/api/attempts/${attemptId}`);
          const attemptData = await attemptResponse.json();

          if (attemptResponse.ok && attemptData.success) {
            setAttempt(attemptData.attempt);
          }
        }
      } catch (err) {
        console.error('Error loading results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [quizId, attemptId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner text="Loading results..." />
      </div>
    );
  }

  // Error state
  if (error || !quiz) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-red-600 mb-4">{error || 'Results not found'}</p>
          <Button onClick={() => router.push('/')}>
            {APP_CONTENT.buttons.backToHome}
          </Button>
        </div>
      </div>
    );
  }

  // Calculate score if we have an attempt
  const score = attempt?.score || 0;
  const total = attempt?.total || quiz.questions.length;
  const percentage = Math.round((score / total) * 100);
  const answers = attempt?.answers || {};

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Results Header */}
      <section className="text-center mb-8 animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {APP_CONTENT.messages.quizComplete}
        </h1>
        <p className="text-gray-600">{quiz.title}</p>
      </section>

      {/* Score Card */}
      <section className="bg-white rounded-3xl shadow-lg p-8 mb-8 text-center animate-slideUp">
        {/* Big score display */}
        <div className="mb-6">
          <span className={`text-6xl font-bold ${getScoreColor(score, total)}`}>
            {score}
          </span>
          <span className="text-4xl text-gray-400">/{total}</span>
        </div>

        {/* Percentage */}
        <div className="mb-6">
          <div className="inline-block px-6 py-2 rounded-full bg-gray-100">
            <span className={`text-2xl font-semibold ${getScoreColor(score, total)}`}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              percentage >= 80
                ? 'bg-green-500'
                : percentage >= 60
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{score}</p>
            <p className="text-sm text-gray-500">Correct</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{total - score}</p>
            <p className="text-sm text-gray-500">Wrong</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-700">
              {attempt?.time_spent ? formatDuration(attempt.time_spent) : '-'}
            </p>
            <p className="text-sm text-gray-500">Time</p>
          </div>
        </div>

        {/* Encouragement message */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10">
          <p className="text-lg">
            {percentage >= 80
              ? '🎉 Excellent work! You really know your stuff!'
              : percentage >= 60
              ? '👍 Good job! Keep studying to improve!'
              : '💪 Keep practicing! You\'ll get better!'}
          </p>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-slideUp">
        <Link href={`/quiz/${quizId}`}>
          <Button variant="outline" leftIcon={<span>🔄</span>}>
            {APP_CONTENT.buttons.retakeQuiz}
          </Button>
        </Link>
        <Link href="/">
          <Button leftIcon={<span>🏠</span>}>
            {APP_CONTENT.buttons.backToHome}
          </Button>
        </Link>
      </section>

      {/* Review Questions Section */}
      <section className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Review Your Answers
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllQuestions(!showAllQuestions)}
          >
            {showAllQuestions ? 'Hide' : 'Show All'}
          </Button>
        </div>

        {/* Questions list */}
        <div className="space-y-4">
          {quiz.questions
            .slice(0, showAllQuestions ? undefined : 3)
            .map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={index + 1}
                totalQuestions={quiz.questions.length}
                selectedAnswer={answers[question.id] || null}
                onAnswerSelect={() => {}}
                showResult={true}
                disabled={true}
              />
            ))}
        </div>

        {/* Show more button */}
        {!showAllQuestions && quiz.questions.length > 3 && (
          <div className="text-center mt-4">
            <Button
              variant="ghost"
              onClick={() => setShowAllQuestions(true)}
            >
              Show {quiz.questions.length - 3} more questions
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
