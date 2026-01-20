// =============================================
// History Page
// =============================================
// View past quizzes and attempts

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Quiz, Attempt } from '@/lib/types';
import { APP_CONTENT } from '@/config/content';
import { formatDate, formatPercentage, getScoreColor } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/LoadingSpinner';

interface QuizWithAttempts extends Quiz {
  attempts: Attempt[];
}

export default function HistoryPage() {
  // State
  const [quizzes, setQuizzes] = useState<QuizWithAttempts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch history data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/quizzes');
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load history');
        }

        setQuizzes(data.quizzes || []);
      } catch (err) {
        console.error('Error loading history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner text="Loading history..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <section className="text-center mb-8 animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz History</h1>
        <p className="text-gray-600">Review your past quizzes and scores</p>
      </section>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!error && quizzes.length === 0 && (
        <div className="text-center py-16 animate-fadeIn">
          <span className="text-6xl block mb-4">📚</span>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No quizzes yet
          </h2>
          <p className="text-gray-500 mb-6">{APP_CONTENT.messages.noQuizzes}</p>
          <Link href="/">
            <Button>{APP_CONTENT.buttons.backToHome}</Button>
          </Link>
        </div>
      )}

      {/* Quiz list */}
      <div className="space-y-6 animate-slideUp">
        {quizzes.map((quiz) => {
          // Get the best attempt
          const bestAttempt = quiz.attempts?.reduce(
            (best, current) =>
              !best || current.score > best.score ? current : best,
            null as Attempt | null
          );

          return (
            <Card key={quiz.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Quiz info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {quiz.source_filename} • {quiz.total_questions} questions
                  </p>
                  <p className="text-xs text-gray-400">
                    Created {formatDate(quiz.created_at)}
                  </p>
                </div>

                {/* Best score */}
                {bestAttempt && (
                  <div className="text-center md:text-right">
                    <p className="text-sm text-gray-500 mb-1">Best Score</p>
                    <p
                      className={`text-2xl font-bold ${getScoreColor(
                        bestAttempt.score,
                        bestAttempt.total
                      )}`}
                    >
                      {formatPercentage(bestAttempt.score, bestAttempt.total)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {bestAttempt.score}/{bestAttempt.total} correct
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/quiz/${quiz.id}`}>
                    <Button variant="outline" size="sm">
                      Retake
                    </Button>
                  </Link>
                  {bestAttempt && (
                    <Link
                      href={`/results/${quiz.id}?attemptId=${bestAttempt.id}`}
                    >
                      <Button variant="ghost" size="sm">
                        View Results
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Attempts timeline */}
              {quiz.attempts && quiz.attempts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">
                    {quiz.attempts.length} attempt(s)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quiz.attempts.slice(0, 5).map((attempt, index) => (
                      <span
                        key={attempt.id}
                        className={`px-3 py-1 text-xs rounded-full ${
                          index === 0
                            ? 'bg-primary/10 text-primary'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {formatPercentage(attempt.score, attempt.total)}
                      </span>
                    ))}
                    {quiz.attempts.length > 5 && (
                      <span className="px-3 py-1 text-xs text-gray-400">
                        +{quiz.attempts.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Back to home */}
      {quizzes.length > 0 && (
        <div className="text-center mt-8 animate-fadeIn">
          <Link href="/">
            <Button variant="outline">{APP_CONTENT.buttons.backToHome}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
