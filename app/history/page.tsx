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
  const [improvementModal, setImprovementModal] = useState<{
    quizTitle: string;
    summary: string;
    highlights: string[];
    actions: string[];
  } | null>(null);
  
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

  const buildQuizImprovementData = (quiz: QuizWithAttempts) => {
    const attempts = quiz.attempts || [];
    const bestAttempt = attempts.reduce(
      (best, current) =>
        !best || current.score > best.score ? current : best,
      null as Attempt | null
    );
    const latestAttempt = attempts[0] || null;
    const averageScore = attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, current) => sum + (current.total > 0 ? (current.score / current.total) * 100 : 0), 0) /
            attempts.length
        )
      : 0;
    const latestScorePercent = latestAttempt && latestAttempt.total > 0
      ? Math.round((latestAttempt.score / latestAttempt.total) * 100)
      : 0;
    const previousAttempt = attempts[1] || null;
    const previousScorePercent = previousAttempt && previousAttempt.total > 0
      ? Math.round((previousAttempt.score / previousAttempt.total) * 100)
      : null;

    const trendSummary = previousScorePercent === null
      ? 'This is your first attempt. Build momentum by taking one more attempt soon.'
      : latestScorePercent > previousScorePercent
      ? `Great progress! You improved by ${latestScorePercent - previousScorePercent}% from your previous attempt.`
      : latestScorePercent < previousScorePercent
      ? `Your latest score is ${previousScorePercent - latestScorePercent}% lower than your previous attempt.`
      : 'Your latest score is unchanged from your previous attempt.';

    const actions = latestScorePercent >= 80
      ? [
          'Retake once in 3-5 days to lock in long-term retention.',
          'Focus on speed and confidence while keeping accuracy high.',
        ]
      : latestScorePercent >= 60
      ? [
          'Review missed questions and explanations from your latest attempt.',
          'Retake this quiz within 24 hours to reinforce memory.',
        ]
      : [
          'Review key notes first before another retake.',
          'Practice flashcards first, then retake this quiz.',
        ];

    const highlights = [
      `Quiz format: ${quiz.question_type.replace('_', ' ')}`,
      `Attempts: ${attempts.length}`,
      `Average score: ${averageScore}%`,
      `Best score: ${bestAttempt ? `${bestAttempt.score}/${bestAttempt.total}` : 'N/A'}`,
      `Latest score: ${latestAttempt ? `${latestAttempt.score}/${latestAttempt.total} (${latestScorePercent}%)` : 'N/A'}`,
    ];

    return {
      quizTitle: quiz.title,
      summary: trendSummary,
      highlights,
      actions,
    };
  };

  const handleOpenImprovement = (quiz: QuizWithAttempts) => {
    setImprovementModal(buildQuizImprovementData(quiz));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner text="Loading history..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
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
              className="w-full px-4 py-3 pl-12 pr-4 bg-[#faf7ff] border-2 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-[inset_0_3px_6px_rgba(91,33,182,0.12)]"
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
                <label className="text-sm text-gray-700 font-semibold whitespace-nowrap min-w-[40px]">Type:</label>
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-44 h-11 px-4 pr-10 appearance-none bg-white border-2 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-semibold shadow-clay-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="identification">Identification</option>
                    <option value="true_false">True/False</option>
                    <option value="mixed">Mixed</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs">
                    ▼
                  </span>
                </div>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 font-semibold whitespace-nowrap min-w-[40px]">Sort:</label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'attempts')}
                    className="w-44 h-11 px-4 pr-10 appearance-none bg-white border-2 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-semibold shadow-clay-sm"
                  >
                    <option value="date">Newest First</option>
                    <option value="score">Best Score</option>
                    <option value="attempts">Most Attempts</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs">
                    ▼
                  </span>
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-ink-soft font-semibold bg-[#faf7ff] px-4 py-2 rounded-full shadow-clay-sm">
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
      <div className="space-y-8 animate-slideUp">
        {filteredQuizzes.map((quiz) => {
          // Get the best attempt
          const bestAttempt = quiz.attempts?.reduce(
            (best, current) =>
              !best || current.score > best.score ? current : best,
            null as Attempt | null
          );
          const latestAttempt = quiz.attempts?.[0] || null;
          const latestScorePercent = latestAttempt && latestAttempt.total > 0
            ? Math.round((latestAttempt.score / latestAttempt.total) * 100)
            : 0;
          const bestPercentage = bestAttempt && bestAttempt.total > 0
            ? Math.round((bestAttempt.score / bestAttempt.total) * 100)
            : 0;
          const scoreStatus = bestPercentage >= 60 ? 'Passed' : 'Needs Review';
          const scoreStatusClass = bestPercentage >= 60 ? 'text-green-600' : 'text-orange-600';

          const mood = latestScorePercent >= 80
            ? {
                title: 'Great Job!',
                emoji: '🎉',
                message: 'You are doing well. Keep the momentum going!',
                className: 'bg-green-50 border-green-200 text-green-700',
              }
            : latestScorePercent >= 60
            ? {
                title: 'Good Progress!',
                emoji: '🎯',
                message: 'You are close. Review mistakes and try one more time.',
                className: 'bg-yellow-50 border-yellow-200 text-yellow-700',
              }
            : {
                title: 'Try Again!',
                emoji: '💪',
                message: 'No worries. Practice flashcards first, then retake.',
                className: 'bg-orange-50 border-orange-200 text-orange-700',
              };

          return (
            <Card
              key={quiz.id}
              className="p-7 md:p-8 bg-gradient-to-br from-white to-[#faf7ff] transition-all duration-300"
              hover
            >
              {/* Main quiz info + vibe panel */}
              <div className="mb-6 grid lg:grid-cols-[1fr_auto] gap-4 items-start">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight break-words">
                    {quiz.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span
                      className="text-sm text-gray-500 max-w-[500px] truncate bg-white/80 border border-gray-200 rounded-lg px-3 py-1"
                      title={quiz.source_filename}
                    >
                      📄 {quiz.source_filename}
                    </span>
                    <span className="text-sm text-gray-500 bg-white/80 border border-gray-200 rounded-lg px-3 py-1">
                      {quiz.total_questions} questions
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
                      {quiz.question_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-gray-500 font-medium">
                    Created {formatDate(quiz.created_at)}
                  </p>
                </div>
                <div className={`rounded-2xl border px-4 py-3 max-w-sm lg:w-[360px] ${mood.className}`}>
                  <p className="font-bold text-base">
                    {mood.emoji} {mood.title}
                  </p>
                  <p className="text-sm mt-1">
                    {mood.message}
                  </p>
                </div>
              </div>

              {/* Attempts timeline */}
              {quiz.attempts && quiz.attempts.length > 0 && (
                <div className="mt-6 pt-5 border-t border-primary/10">
                  <div className="grid gap-4 md:gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                    {/* Left column: attempts text + score history (all aligned) */}
                    <div className="max-w-2xl">
                      <p className="text-sm font-semibold text-gray-700">
                        {quiz.attempts.length} attempt{quiz.attempts.length !== 1 ? 's' : ''}
                      </p>

                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                            Score History
                          </p>
                          {quiz.attempts.length > 1 && (
                            <Link
                              href={`/results/${quiz.id}`}
                              className="text-xs text-primary hover:text-primary-dark font-semibold bg-primary/5 px-3 py-1 rounded-full"
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
                                title={`Attempt on ${formatDate(attempt.completed_at)}`}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-sm ${
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

                        {quiz.attempts.length === 1 && (
                          <p className="text-xs text-gray-500 mt-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 inline-block">
                            Take this quiz again to track your progress over time.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right column: best score and actions */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-5 lg:justify-self-end">
                      {bestAttempt && (
                        <div className="relative overflow-hidden px-6 py-5 bg-gradient-to-br from-white to-primary/5 border border-primary/20 rounded-2xl shadow-sm min-w-[190px]">
                          <div className="absolute -top-7 -right-7 w-20 h-20 rounded-full bg-primary/10 pointer-events-none" />
                          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500 mb-1 font-bold">Best Score</p>
                          <p
                            className={`text-4xl leading-none font-extrabold mb-2 ${getScoreColor(
                              bestAttempt.score,
                              bestAttempt.total
                            )}`}
                          >
                            {formatPercentage(bestAttempt.score, bestAttempt.total)}
                          </p>
                          <p className="text-xs text-gray-600 font-semibold">
                            {bestAttempt.score}/{bestAttempt.total} correct
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className={`font-semibold ${scoreStatusClass}`}>{scoreStatus}</span>
                            {latestAttempt && (
                              <span className="text-gray-500">
                                • Last {formatPercentage(latestAttempt.score, latestAttempt.total)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="bg-white/85 border border-gray-200 rounded-2xl p-2.5">
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5">
                            <Link href={`/quiz/${quiz.id}`}>
                              <Button size="sm" className="w-full sm:w-auto">
                                🔄 Retake
                              </Button>
                            </Link>
                            {bestAttempt && (
                              <>
                                <Link href={`/results/${quiz.id}?attemptId=${bestAttempt.id}`}>
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
                        <div className="mt-2.5">
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => handleOpenImprovement(quiz)}
                            >
                              What's to improve?
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Improvement popup modal */}
      {improvementModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl clay-lg p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">What to Improve</h2>
                <p className="text-sm text-gray-600 mt-1">{improvementModal.quizTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setImprovementModal(null)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                aria-label="Close improvement popup"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-sm text-gray-800 font-medium">{improvementModal.summary}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-2">Quiz Snapshot</h3>
              <div className="space-y-1.5">
                {improvementModal.highlights.map((item, index) => (
                  <p key={index} className="text-sm text-gray-700">• {item}</p>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-2">Recommended Actions</h3>
              <div className="space-y-1.5">
                {improvementModal.actions.map((item, index) => (
                  <p key={index} className="text-sm text-gray-700">• {item}</p>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setImprovementModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

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
