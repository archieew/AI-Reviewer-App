// =============================================
// Analytics Dashboard Page
// =============================================
// View study progress, statistics, and insights

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Quiz, Attempt } from '@/lib/types';
import { APP_CONTENT } from '@/config/content';
import { formatDate, formatPercentage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/LoadingSpinner';

interface QuizWithAttempts extends Quiz {
  attempts: Attempt[];
}

interface AnalyticsData {
  totalQuizzes: number;
  totalAttempts: number;
  totalQuestions: number;
  averageScore: number;
  bestScore: number;
  improvementRate: number;
  studyStreak: number;
  recentActivity: Attempt[];
  topQuizzes: QuizWithAttempts[];
  weakAreas: { type: string; averageScore: number; count: number }[];
}

export default function AnalyticsPage() {
  // State
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/quizzes');
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load analytics');
        }

        const quizzes: QuizWithAttempts[] = data.quizzes || [];
        const allAttempts: Attempt[] = quizzes.flatMap((q) => q.attempts || []);

        // Calculate analytics
        const totalQuizzes = quizzes.length;
        const totalAttempts = allAttempts.length;
        const totalQuestions = quizzes.reduce((sum, q) => sum + q.total_questions, 0);

        // Calculate average score
        const scores = allAttempts.map((a) => (a.score / a.total) * 100);
        const averageScore = scores.length > 0
          ? scores.reduce((sum, s) => sum + s, 0) / scores.length
          : 0;

        // Find best score
        const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

        // Calculate improvement rate (compare first vs last attempt for each quiz)
        let improvements = 0;
        let totalComparisons = 0;
        quizzes.forEach((quiz) => {
          if (quiz.attempts && quiz.attempts.length >= 2) {
            const sorted = [...quiz.attempts].sort(
              (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
            );
            const firstScore = (sorted[0].score / sorted[0].total) * 100;
            const lastScore = (sorted[sorted.length - 1].score / sorted[sorted.length - 1].total) * 100;
            if (lastScore > firstScore) improvements++;
            totalComparisons++;
          }
        });
        const improvementRate = totalComparisons > 0 ? (improvements / totalComparisons) * 100 : 0;

        // Calculate study streak (days with at least one attempt)
        const attemptDates = new Set(
          allAttempts.map((a) => new Date(a.completed_at).toDateString())
        );
        const sortedDates = Array.from(attemptDates)
          .map((d) => new Date(d).getTime())
          .sort((a, b) => b - a);

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let currentDate = today.getTime();

        for (const date of sortedDates) {
          const attemptDate = new Date(date);
          attemptDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((currentDate - attemptDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff === streak) {
            streak++;
            currentDate = attemptDate.getTime();
          } else {
            break;
          }
        }

        // Get recent activity (last 5 attempts)
        const recentActivity = [...allAttempts]
          .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
          .slice(0, 5);

        // Get top quizzes (by best score)
        const topQuizzes = [...quizzes]
          .map((q) => {
            const best = q.attempts?.reduce(
              (best, current) =>
                !best || current.score > best.score ? current : best,
              null as Attempt | null
            );
            return {
              ...q,
              bestScore: best ? (best.score / best.total) * 100 : 0,
            };
          })
          .sort((a, b) => (b as any).bestScore - (a as any).bestScore)
          .slice(0, 5)
          .map((q) => {
            const { bestScore, ...rest } = q as any;
            return rest;
          });

        // Calculate weak areas by question type
        const typeStats: Record<string, { total: number; correct: number; count: number }> = {};
        quizzes.forEach((quiz) => {
          const type = quiz.question_type;
          if (!typeStats[type]) {
            typeStats[type] = { total: 0, correct: 0, count: 0 };
          }
          quiz.attempts?.forEach((attempt) => {
            typeStats[type].total += attempt.total;
            typeStats[type].correct += attempt.score;
            typeStats[type].count++;
          });
        });

        const weakAreas = Object.entries(typeStats)
          .map(([type, stats]) => ({
            type,
            averageScore: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
            count: stats.count,
          }))
          .sort((a, b) => a.averageScore - b.averageScore)
          .slice(0, 3);

        setAnalytics({
          totalQuizzes,
          totalAttempts,
          totalQuestions,
          averageScore: Math.round(averageScore),
          bestScore: Math.round(bestScore),
          improvementRate: Math.round(improvementRate),
          studyStreak: streak,
          recentActivity,
          topQuizzes,
          weakAreas,
        });
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner text="Loading analytics..." />
      </div>
    );
  }

  // Error state
  if (error || !analytics) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-red-600 mb-4">{error || 'Analytics not available'}</p>
          <Link href="/">
            <Button>{APP_CONTENT.buttons.backToHome}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <section className="text-center mb-8 animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Analytics</h1>
        <p className="text-gray-600">Track your progress and identify areas for improvement</p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slideUp">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">{analytics.totalQuizzes}</div>
          <div className="text-sm text-gray-600">Total Quizzes</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-accent mb-2">{analytics.totalAttempts}</div>
          <div className="text-sm text-gray-600">Total Attempts</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {formatPercentage(analytics.averageScore, 100)}
          </div>
          <div className="text-sm text-gray-600">Average Score</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{analytics.studyStreak}</div>
          <div className="text-sm text-gray-600">Day Streak 🔥</div>
        </Card>
      </section>

      {/* Main Stats */}
      <section className="grid md:grid-cols-2 gap-6 mb-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
        {/* Best Score & Improvement */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Highlights</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Best Score</div>
              <div className="text-3xl font-bold text-green-600">
                {formatPercentage(analytics.bestScore, 100)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Improvement Rate</div>
              <div className="text-3xl font-bold text-primary">
                {formatPercentage(analytics.improvementRate, 100)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Quizzes where you improved
              </div>
            </div>
          </div>
        </Card>

        {/* Weak Areas */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Areas to Focus On</h2>
          {analytics.weakAreas.length > 0 ? (
            <div className="space-y-3">
              {analytics.weakAreas.map((area, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {area.type.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-500">{area.count} attempts</div>
                  </div>
                  <div className="text-xl font-bold text-orange-600">
                    {formatPercentage(area.averageScore, 100)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Keep studying to identify weak areas!</p>
          )}
        </Card>
      </section>

      {/* Recent Activity & Top Quizzes */}
      <section className="grid md:grid-cols-2 gap-6 mb-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {analytics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentActivity.map((attempt, index) => {
                const quiz = analytics.topQuizzes.find((q) =>
                  q.attempts?.some((a) => a.id === attempt.id)
                ) || analytics.topQuizzes[0];
                return (
                  <div key={attempt.id || index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {quiz?.title || 'Quiz'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(attempt.completed_at)}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {formatPercentage(attempt.score, attempt.total)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No recent activity</p>
          )}
        </Card>

        {/* Top Quizzes */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Top Performing Quizzes</h2>
          {analytics.topQuizzes.length > 0 ? (
            <div className="space-y-3">
              {analytics.topQuizzes.map((quiz, index) => {
                const best = quiz.attempts?.reduce(
                  (best, current) =>
                    !best || current.score > best.score ? current : best,
                  null as Attempt | null
                );
                return (
                  <Link
                    key={quiz.id}
                    href={`/results/${quiz.id}?attemptId=${best?.id || ''}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{quiz.title}</div>
                      <div className="text-xs text-gray-500">
                        {quiz.total_questions} questions
                      </div>
                    </div>
                    {best && (
                      <div className="text-lg font-bold text-green-600">
                        {formatPercentage(best.score, best.total)}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No quizzes yet</p>
          )}
        </Card>
      </section>

      {/* Actions */}
      <section className="text-center animate-fadeIn">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/history">
            <Button variant="outline">View History</Button>
          </Link>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
