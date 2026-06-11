// =============================================
// Analytics Dashboard Page
// =============================================
// View study progress, statistics, and insights

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { APP_CONTENT } from '@/config/content';
import { Attempt, Quiz } from '@/lib/types';
import type { PlayerStats } from '@/lib/game';
import { formatDate, formatDuration, formatPercentage, truncateText } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/LoadingSpinner';

interface QuizWithAttempts extends Quiz {
  attempts: Attempt[];
}

interface AttemptActivity extends Attempt {
  quizId: string;
  quizTitle: string;
  questionType: string;
}

interface TrendPoint {
  label: string;
  averageScore: number;
  attempts: number;
}

interface TopQuizItem {
  quiz: QuizWithAttempts;
  bestAttempt: Attempt | null;
  bestScore: number;
}

interface WeakAreaInsight {
  type: string;
  averageScore: number;
  count: number;
  totalQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
}

interface MissedQuizInsight {
  quizId: string;
  title: string;
  wrongQuestions: number;
  attempts: number;
}

interface GoalProgress {
  label: string;
  current: number;
  target: number;
  progress: number;
}

interface Badge {
  name: string;
  description: string;
}

interface AnalyticsData {
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  improvementRate: number;
  weeklyDelta: number;
  daysStudiedThisWeek: number;
  weeklyAttempts: number;
  todayStudyTime: number;
  weekStudyTime: number;
  totalStudyTime: number;
  trend: TrendPoint[];
  recentActivity: AttemptActivity[];
  topQuizzes: TopQuizItem[];
  weakAreas: WeakAreaInsight[];
  mostMissedQuizzes: MissedQuizInsight[];
  focusArea: WeakAreaInsight | null;
  recommendedQuizId: string | null;
  recommendedQuizTitle: string;
  focusGoal: GoalProgress | null;
  badges: Badge[];
  player: PlayerStats;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load analytics');
        }
        setAnalytics(data.analytics as AnalyticsData);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner text="Loading analytics..." />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
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

  const maxTrendScore = Math.max(...analytics.trend.map((day) => day.averageScore), 1);
  const hasWeeklyAttempts = analytics.weeklyAttempts > 0;
  const weeklyDeltaText = analytics.weeklyDelta >= 0
    ? `+${analytics.weeklyDelta}% this week`
    : `${analytics.weeklyDelta}% this week`;
  const weeklyDeltaClass = !hasWeeklyAttempts
    ? 'text-gray-700'
    : analytics.weeklyDelta >= 0
    ? 'text-green-700'
    : 'text-orange-700';
  const weeklyDeltaBg = !hasWeeklyAttempts
    ? 'bg-gray-50 border-gray-200'
    : analytics.weeklyDelta >= 0
    ? 'bg-green-50 border-green-200'
    : 'bg-orange-50 border-orange-200';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="text-center mb-6 animate-fadeIn">
        <h1 className="text-3xl md:text-4xl font-extrabold text-ink mb-2">📊 Study Analytics</h1>
        <p className="text-ink-soft">Track progress, keep momentum, and improve smarter.</p>
      </section>

      {/* Player level / XP / streak hero */}
      <section className="clay-lg p-6 md:p-8 mb-6 animate-slideUp">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Level ring */}
          <div
            className="w-28 h-28 rounded-full grid place-items-center shadow-clay-md flex-shrink-0"
            style={{
              background: `conic-gradient(#7c3aed 0% ${analytics.player.levelProgress}%, #e6ddfa ${analytics.player.levelProgress}% 100%)`,
            }}
            title={`${analytics.player.levelProgress}% to level ${analytics.player.level + 1}`}
          >
            <div className="w-20 h-20 rounded-full bg-white grid place-items-center shadow-[inset_0_4px_8px_rgba(124,58,237,0.08)]">
              <div className="text-center">
                <span className="block text-2xl font-extrabold text-primary leading-none">
                  {analytics.player.level}
                </span>
                <span className="block text-[9px] font-bold tracking-widest text-ink-soft mt-0.5">
                  LEVEL
                </span>
              </div>
            </div>
          </div>

          {/* XP + streak stats */}
          <div className="flex-1 w-full">
            <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
              <p className="font-extrabold text-ink text-lg">
                ⭐ {analytics.player.totalXp.toLocaleString()} XP
              </p>
              <p className="text-xs font-semibold text-ink-soft">
                {analytics.player.xpForNextLevel - analytics.player.xpIntoLevel} XP to level{' '}
                {analytics.player.level + 1}
              </p>
            </div>
            <div className="clay-inset h-4 overflow-hidden mb-4">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-light to-primary shadow-[inset_0_2px_3px_rgba(255,255,255,0.4)] transition-all duration-700"
                style={{ width: `${analytics.player.levelProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="clay-sm py-3 text-center">
                <p className="text-2xl font-extrabold text-orange-500">
                  🔥 {analytics.player.currentStreak}
                </p>
                <p className="text-xs font-bold tracking-wider text-ink-soft">
                  DAY STREAK{' '}
                  {analytics.player.currentStreak > 0 && !analytics.player.studiedToday && (
                    <span className="text-orange-400 normal-case">— study today to keep it!</span>
                  )}
                </p>
              </div>
              <div className="clay-sm py-3 text-center">
                <p className="text-2xl font-extrabold text-amber-500">
                  🏆 {analytics.player.longestStreak}
                </p>
                <p className="text-xs font-bold tracking-wider text-ink-soft">LONGEST STREAK</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`mb-6 p-4 rounded-clay-sm border-0 shadow-clay-sm animate-slideUp ${weeklyDeltaBg}`}>
        <p className={`text-sm md:text-base font-semibold ${weeklyDeltaClass}`}>
          {hasWeeklyAttempts
            ? `You are trending ${analytics.weeklyDelta >= 0 ? 'up' : 'down'}: ${weeklyDeltaText}`
            : 'No attempts yet this week. Start one to build momentum.'}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {hasWeeklyAttempts
            ? 'Based on your average score this week vs last week.'
            : 'Your weekly trend will appear after your next attempt.'}
        </p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-slideUp">
        <Card className="p-5 text-center border-primary/10">
          <div className="text-3xl font-bold text-primary mb-1">{analytics.totalQuizzes}</div>
          <div className="text-sm text-gray-600">Total Quizzes</div>
        </Card>
        <Card className="p-5 text-center border-accent/20">
          <div className="text-3xl font-bold text-accent mb-1">{analytics.totalAttempts}</div>
          <div className="text-sm text-gray-600">Total Attempts</div>
        </Card>
        <Card className="p-5 text-center border-green-200">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {formatPercentage(analytics.averageScore, 100)}
          </div>
          <div className="text-sm text-gray-600">Average Score</div>
        </Card>
        <Card className="p-5 text-center border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-1">{analytics.daysStudiedThisWeek}/7</div>
          <div className="text-sm text-gray-600">Days Studied (Week)</div>
        </Card>
      </section>

      <section className="grid md:grid-cols-3 gap-4 mb-6 animate-slideUp" style={{ animationDelay: '0.05s' }}>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1 font-semibold">Study Time Today</p>
          <p className="text-2xl font-bold text-gray-900">{formatDuration(analytics.todayStudyTime)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1 font-semibold">Study Time This Week</p>
          <p className="text-2xl font-bold text-gray-900">{formatDuration(analytics.weekStudyTime)}</p>
          <p className="text-xs text-gray-500 mt-1">{analytics.weeklyAttempts} attempts this week</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1 font-semibold">Total Study Time</p>
          <p className="text-2xl font-bold text-gray-900">{formatDuration(analytics.totalStudyTime)}</p>
        </Card>
      </section>

      <section className="mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">7-Day Progress Trend</h2>
            <p className="text-xs text-gray-500">Avg score + attempts per day</p>
          </div>
          <div className="grid grid-cols-7 gap-2 items-end h-44">
            {analytics.trend.map((day) => (
              <div key={day.label} className="flex flex-col items-center justify-end h-full">
                {day.attempts > 0 ? (
                  <div
                    className="w-full max-w-[46px] rounded-t-full bg-gradient-to-t from-primary to-accent/60 shadow-[inset_0_2px_3px_rgba(255,255,255,0.4)]"
                    style={{ height: `${Math.max(8, (day.averageScore / maxTrendScore) * 120)}px` }}
                    title={`${day.label}: ${day.averageScore}% average score, ${day.attempts} attempts`}
                  />
                ) : (
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-gray-300 mb-1"
                    title={`${day.label}: no attempts`}
                  />
                )}
                <p className="text-[11px] text-gray-500 mt-2">{day.label}</p>
                <p className="text-[11px] font-semibold text-primary">{day.averageScore}%</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid lg:grid-cols-2 gap-6 mb-6 animate-slideUp" style={{ animationDelay: '0.15s' }}>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Focus Plan</h2>
          {analytics.focusArea ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-orange-50 border border-orange-200 p-4">
                <p className="text-xs uppercase tracking-wide text-orange-700 font-semibold mb-1">Weakest Topic</p>
                <p className="text-lg font-bold text-gray-900 capitalize">
                  {analytics.focusArea.type.replace('_', ' ')}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Current accuracy: <span className="font-semibold text-orange-700">{Math.round(analytics.focusArea.averageScore)}%</span>
                </p>
                <p className="text-sm text-gray-600">
                  Target accuracy: <span className="font-semibold text-green-700">70%</span>
                </p>
              </div>
              {analytics.focusGoal && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-600 capitalize">{analytics.focusGoal.label}</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {analytics.focusGoal.current}% / {analytics.focusGoal.target}%
                    </p>
                  </div>
                  <div className="clay-inset h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-400 to-primary shadow-[inset_0_2px_3px_rgba(255,255,255,0.4)]"
                      style={{ width: `${Math.min(100, analytics.focusGoal.progress)}%` }}
                    />
                  </div>
                </div>
              )}
              <Link href={analytics.recommendedQuizId ? `/quiz/${analytics.recommendedQuizId}` : '/history'}>
                <Button className="w-full md:w-auto mt-3">
                  Practice Weak Area
                </Button>
              </Link>
              <p className="text-xs text-gray-500 -mt-2">
                Recommended quiz: {truncateText(analytics.recommendedQuizTitle, 42)}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Complete more attempts to unlock focus recommendations.</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Motivation Badges</h2>
          {analytics.badges.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {analytics.badges.map((badge) => (
                <div key={badge.name} className="rounded-clay-sm bg-gradient-to-br from-[#fff3cf] to-[#ffe7a0] shadow-clay-sm p-3 hover:animate-wiggle">
                  <p className="font-extrabold text-amber-700">🏅 {badge.name}</p>
                  <p className="text-xs text-amber-800/70 mt-1">{badge.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Keep practicing to unlock your first badge.</p>
          )}
        </Card>
      </section>

      <section className="grid lg:grid-cols-2 gap-6 mb-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Why This Recommendation</h2>
          {analytics.focusArea ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                <p className="text-xs uppercase tracking-wide text-primary font-semibold mb-1">Primary Signal</p>
                <p className="text-sm text-gray-700">
                  Your lowest scoring format is <span className="font-semibold capitalize">{analytics.focusArea.type.replace('_', ' ')}</span>
                  {' '}at <span className="font-semibold text-orange-700">{Math.round(analytics.focusArea.averageScore)}%</span>.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-gray-200 p-3 bg-white">
                  <p className="text-xs text-gray-500">Attempts</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.focusArea.count}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 bg-white">
                  <p className="text-xs text-gray-500">Wrong</p>
                  <p className="text-xl font-bold text-orange-600">{analytics.focusArea.wrongQuestions}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 bg-white">
                  <p className="text-xs text-gray-500">Target Gap</p>
                  <p className="text-xl font-bold text-primary">
                    {Math.max(0, 70 - Math.round(analytics.focusArea.averageScore))}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Focus here first for the fastest score improvement.
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Complete more attempts to generate a recommendation reason.</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Most Missed Quizzes</h2>
          {analytics.mostMissedQuizzes.length > 0 ? (
            <div className="space-y-3">
              {analytics.mostMissedQuizzes.map((quiz) => (
                <Link
                  key={quiz.quizId}
                  href={`/quiz/${quiz.quizId}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{quiz.title}</p>
                    <p className="text-xs text-gray-500">{quiz.attempts} attempts</p>
                  </div>
                  <p className="text-sm font-bold text-orange-600">{quiz.wrongQuestions} wrong</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No missed-quiz insights yet.</p>
          )}
        </Card>
      </section>

      <section className="grid lg:grid-cols-2 gap-6 mb-8 animate-slideUp" style={{ animationDelay: '0.25s' }}>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {analytics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentActivity.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/results/${activity.quizId}?attemptId=${activity.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{activity.quizTitle}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.completed_at)}</p>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {formatPercentage(activity.score, activity.total)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent activity yet.</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Top Performing Quizzes</h2>
          {analytics.topQuizzes.length > 0 ? (
            <div className="space-y-3">
              {analytics.topQuizzes.map((item) => (
                <Link
                  key={item.quiz.id}
                  href={`/results/${item.quiz.id}?attemptId=${item.bestAttempt?.id || ''}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.quiz.title}</p>
                    <p className="text-xs text-gray-500">{item.quiz.total_questions} questions</p>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {item.bestAttempt ? formatPercentage(item.bestAttempt.score, item.bestAttempt.total) : '0%'}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No top quiz data yet.</p>
          )}
        </Card>
      </section>

      <section className="text-center animate-fadeIn">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/history">
            <Button variant="outline">View History</Button>
          </Link>
          <Link href={analytics.recommendedQuizId ? `/quiz/${analytics.recommendedQuizId}` : '/'}>
            <Button>Practice Weak Area</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">{APP_CONTENT.buttons.backToHome}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
