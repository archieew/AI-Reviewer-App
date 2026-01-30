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
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizWithAttempts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'attempts'>('date');

  // Fetch history data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/quizzes');
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load history');
        }

        const quizzesData = data.quizzes || [];
        setQuizzes(quizzesData);
        setFilteredQuizzes(quizzesData);
      } catch (err) {
        console.error('Error loading history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Filter and sort quizzes
  useEffect(() => {
    let filtered = [...quizzes];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(query) ||
          quiz.source_filename.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((quiz) => quiz.question_type === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'score') {
        const aBest = a.attempts?.reduce(
          (best, current) => (!best || current.score > best.score ? current : best),
          null as Attempt | null
        );
        const bBest = b.attempts?.reduce(
          (best, current) => (!best || current.score > best.score ? current : best),
          null as Attempt | null
        );
        const aScore = aBest ? aBest.score / aBest.total : 0;
        const bScore = bBest ? bBest.score / bBest.total : 0;
        return bScore - aScore;
      } else {
        // Sort by attempts count
        return (b.attempts?.length || 0) - (a.attempts?.length || 0);
      }
    });

    setFilteredQuizzes(filtered);
  }, [quizzes, searchQuery, filterType, sortBy]);

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
        <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">Quiz History</h1>
        <p className="text-gray-600 text-lg">Review your past quizzes and scores</p>
      </section>

      {/* Search and Filter Section */}
      {quizzes.length > 0 && (
        <Card className="mb-6 p-6 animate-slideUp">
          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search by title or filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 pr-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Quiz Type Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 font-medium whitespace-nowrap">Type:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium shadow-sm"
                >
                  <option value="all">All Types</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="identification">Identification</option>
                  <option value="true_false">True/False</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 font-medium whitespace-nowrap">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'attempts')}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium shadow-sm"
                >
                  <option value="date">Newest First</option>
                  <option value="score">Best Score</option>
                  <option value="attempts">Most Attempts</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600 font-medium bg-gray-50 px-4 py-2 rounded-lg">
              Showing <span className="text-primary font-semibold">{filteredQuizzes.length}</span> of{' '}
              <span className="text-primary font-semibold">{quizzes.length}</span> quizzes
            </div>
          </div>
        </Card>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* Empty state - no quizzes at all */}
      {!error && quizzes.length === 0 && (
        <Card className="text-center py-16 animate-fadeIn">
          <span className="text-6xl block mb-4">📚</span>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No quizzes yet
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {APP_CONTENT.messages.noQuizzes}
          </p>
          <Link href="/">
            <Button size="lg">{APP_CONTENT.buttons.backToHome}</Button>
          </Link>
        </Card>
      )}

      {/* No results from filter */}
      {!error && quizzes.length > 0 && filteredQuizzes.length === 0 && (
        <Card className="text-center py-16 animate-fadeIn">
          <span className="text-6xl block mb-4">🔍</span>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No quizzes found
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Try adjusting your search or filters to find what you're looking for
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setSortBy('date');
            }}
            size="lg"
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {/* Quiz list */}
      <div className="space-y-6 animate-slideUp">
        {filteredQuizzes.map((quiz) => {
          // Get the best attempt
          const bestAttempt = quiz.attempts?.reduce(
            (best, current) =>
              !best || current.score > best.score ? current : best,
            null as Attempt | null
          );

          return (
            <Card key={quiz.id} className="p-6 hover:shadow-md transition-shadow" hover>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Quiz info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                    {quiz.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-sm text-gray-500">
                      📄 {quiz.source_filename}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {quiz.total_questions} questions
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary capitalize">
                      {quiz.question_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Created {formatDate(quiz.created_at)}
                  </p>
                </div>

                {/* Best score */}
                {bestAttempt && (
                  <div className="text-center md:text-right px-4 py-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Best Score</p>
                    <p
                      className={`text-3xl font-bold mb-1 ${getScoreColor(
                        bestAttempt.score,
                        bestAttempt.total
                      )}`}
                    >
                      {formatPercentage(bestAttempt.score, bestAttempt.total)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {bestAttempt.score}/{bestAttempt.total} correct
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href={`/quiz/${quiz.id}`}>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      🔄 Retake
                    </Button>
                  </Link>
                  {bestAttempt && (
                    <>
                      <Link
                        href={`/results/${quiz.id}?attemptId=${bestAttempt.id}`}
                      >
                        <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                          📊 Results
                        </Button>
                      </Link>
                      <Link href={`/flashcards/${quiz.id}`}>
                        <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                          🃏 Flashcards
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Attempts timeline */}
              {quiz.attempts && quiz.attempts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      {quiz.attempts.length} attempt{quiz.attempts.length !== 1 ? 's' : ''}
                    </p>
                    {quiz.attempts.length > 1 && (
                      <Link
                        href={`/results/${quiz.id}`}
                        className="text-xs text-primary hover:text-primary-dark font-medium"
                      >
                        Compare all →
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quiz.attempts.slice(0, 5).map((attempt, index) => {
                      const attemptPercentage = (attempt.score / attempt.total) * 100;
                      return (
                        <span
                          key={attempt.id}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            index === 0
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : attemptPercentage >= 80
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : attemptPercentage >= 60
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {formatPercentage(attempt.score, attempt.total)}
                        </span>
                      );
                    })}
                    {quiz.attempts.length > 5 && (
                      <span className="px-3 py-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
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
      {filteredQuizzes.length > 0 && (
        <div className="text-center mt-8 animate-fadeIn">
          <Link href="/">
            <Button variant="outline">{APP_CONTENT.buttons.backToHome}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
