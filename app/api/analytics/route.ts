// =============================================
// Analytics API Route
// =============================================
// Returns aggregated dashboard metrics
// GET /api/analytics

import { NextResponse } from 'next/server';
import { Attempt, Quiz, getAllQuizzes, getAttemptsByQuizId, isSupabaseConfigured } from '@/lib/supabase';

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
}

function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function startOfWeek(date: Date): Date {
  const value = startOfDay(date);
  const day = value.getDay();
  const offset = day === 0 ? 6 : day - 1;
  value.setDate(value.getDate() - offset);
  return value;
}

function scorePercent(attempt: Attempt): number {
  return attempt.total > 0 ? (attempt.score / attempt.total) * 100 : 0;
}

function averageScoreForAttempts(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0;
  const total = attempts.reduce((sum, attempt) => sum + scorePercent(attempt), 0);
  return total / attempts.length;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Database not configured. Please add Supabase credentials to .env.local' },
        { status: 500 }
      );
    }

    const quizzes = await getAllQuizzes();
    const quizzesWithAttempts: QuizWithAttempts[] = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await getAttemptsByQuizId(quiz.id);
        return { ...quiz, attempts };
      })
    );

    const allActivity: AttemptActivity[] = quizzesWithAttempts.flatMap((quiz) =>
      (quiz.attempts || []).map((attempt) => ({
        ...attempt,
        quizId: quiz.id,
        quizTitle: quiz.title,
        questionType: quiz.question_type,
      }))
    );
    const allAttempts: Attempt[] = allActivity;

    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    const totalQuizzes = quizzesWithAttempts.length;
    const totalAttempts = allAttempts.length;
    const scores = allAttempts.map(scorePercent);
    const averageScore = scores.length > 0
      ? scores.reduce((sum, value) => sum + value, 0) / scores.length
      : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    let improvements = 0;
    let comparableQuizzes = 0;
    quizzesWithAttempts.forEach((quiz) => {
      if (!quiz.attempts || quiz.attempts.length < 2) return;
      const ordered = [...quiz.attempts].sort(
        (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
      );
      const first = scorePercent(ordered[0]);
      const latest = scorePercent(ordered[ordered.length - 1]);
      if (latest > first) improvements++;
      comparableQuizzes++;
    });
    const improvementRate = comparableQuizzes > 0 ? (improvements / comparableQuizzes) * 100 : 0;

    const weeklyAttemptsList = allAttempts.filter(
      (attempt) => new Date(attempt.completed_at).getTime() >= weekStart.getTime()
    );
    const previousWeekAttempts = allAttempts.filter((attempt) => {
      const timestamp = new Date(attempt.completed_at).getTime();
      return timestamp >= prevWeekStart.getTime() && timestamp < weekStart.getTime();
    });
    const currentWeekAverage = averageScoreForAttempts(weeklyAttemptsList);
    const previousWeekAverage = averageScoreForAttempts(previousWeekAttempts);
    const weeklyDelta = currentWeekAverage - previousWeekAverage;

    const daysStudiedSet = new Set(
      weeklyAttemptsList.map((attempt) => startOfDay(new Date(attempt.completed_at)).toISOString())
    );

    const todayStudyTime = allAttempts
      .filter((attempt) => new Date(attempt.completed_at).getTime() >= todayStart.getTime())
      .reduce((sum, attempt) => sum + (attempt.time_spent || 0), 0);
    const weekStudyTime = weeklyAttemptsList.reduce(
      (sum, attempt) => sum + (attempt.time_spent || 0),
      0
    );
    const totalStudyTime = allAttempts.reduce((sum, attempt) => sum + (attempt.time_spent || 0), 0);

    const trend: TrendPoint[] = Array.from({ length: 7 }).map((_, index) => {
      const dayOffset = 6 - index;
      const day = startOfDay(new Date(now));
      day.setDate(day.getDate() - dayOffset);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const dayAttempts = allAttempts.filter((attempt) => {
        const timestamp = new Date(attempt.completed_at).getTime();
        return timestamp >= day.getTime() && timestamp < nextDay.getTime();
      });
      const dayAverage = averageScoreForAttempts(dayAttempts);
      return {
        label: day.toLocaleDateString('en-US', { weekday: 'short' }),
        averageScore: Math.round(dayAverage),
        attempts: dayAttempts.length,
      };
    });

    const recentActivity = [...allActivity]
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      .slice(0, 6);

    const topQuizzes: TopQuizItem[] = quizzesWithAttempts
      .map((quiz) => {
        const bestAttempt = quiz.attempts?.reduce((best, current) => {
          if (!best || scorePercent(current) > scorePercent(best)) return current;
          return best;
        }, null as Attempt | null);
        return {
          quiz,
          bestAttempt,
          bestScore: bestAttempt ? scorePercent(bestAttempt) : 0,
        };
      })
      .filter((item) => item.bestAttempt)
      .sort((a, b) => b.bestScore - a.bestScore)
      .slice(0, 5);

    const typeStats: Record<string, WeakAreaInsight> = {};
    quizzesWithAttempts.forEach((quiz) => {
      const type = quiz.question_type;
      if (!typeStats[type]) {
        typeStats[type] = {
          type,
          averageScore: 0,
          count: 0,
          totalQuestions: 0,
          correctQuestions: 0,
          wrongQuestions: 0,
        };
      }
      quiz.attempts?.forEach((attempt) => {
        typeStats[type].count++;
        typeStats[type].totalQuestions += attempt.total;
        typeStats[type].correctQuestions += attempt.score;
        typeStats[type].wrongQuestions += Math.max(attempt.total - attempt.score, 0);
      });
    });
    const weakAreas = Object.values(typeStats)
      .map((item) => ({
        ...item,
        averageScore: item.totalQuestions > 0
          ? (item.correctQuestions / item.totalQuestions) * 100
          : 0,
      }))
      .sort((a, b) => a.averageScore - b.averageScore);
    const focusArea = weakAreas.length > 0 ? weakAreas[0] : null;

    const mostMissedQuizzes = quizzesWithAttempts
      .map((quiz) => {
        const attempts = quiz.attempts || [];
        const wrongQuestions = attempts.reduce(
          (sum, attempt) => sum + Math.max(attempt.total - attempt.score, 0),
          0
        );
        return {
          quizId: quiz.id,
          title: quiz.title,
          wrongQuestions,
          attempts: attempts.length,
        };
      })
      .filter((quiz) => quiz.attempts > 0)
      .sort((a, b) => b.wrongQuestions - a.wrongQuestions)
      .slice(0, 5);

    const recommendedQuiz = focusArea
      ? quizzesWithAttempts
          .filter((quiz) => quiz.question_type === focusArea.type)
          .map((quiz) => {
            const bestAttempt = quiz.attempts?.reduce((best, current) => {
              if (!best || scorePercent(current) > scorePercent(best)) return current;
              return best;
            }, null as Attempt | null);
            return {
              quiz,
              bestScore: bestAttempt ? scorePercent(bestAttempt) : 0,
            };
          })
          .sort((a, b) => a.bestScore - b.bestScore)[0]
      : null;

    const focusTarget = 70;
    const focusGoal = focusArea
      ? {
          label: `${focusArea.type.replace('_', ' ')} accuracy`,
          current: Math.round(focusArea.averageScore),
          target: focusTarget,
          progress: Math.min(100, Math.round((focusArea.averageScore / focusTarget) * 100)),
        }
      : null;

    const badges: Badge[] = [];
    if (totalAttempts >= 10) {
      badges.push({ name: 'Consistent Learner', description: 'Completed 10+ attempts' });
    }
    if (Math.round(averageScore) >= 80) {
      badges.push({ name: 'High Accuracy', description: 'Maintained 80%+ average score' });
    }
    if (Math.round(weeklyDelta) > 0) {
      badges.push({ name: 'Trending Up', description: `Improved by ${Math.round(weeklyDelta)}% this week` });
    }
    if (daysStudiedSet.size >= 4) {
      badges.push({ name: 'Weekly Momentum', description: 'Studied on 4+ days this week' });
    }
    if (totalStudyTime >= 3600) {
      badges.push({ name: 'Focus Hour', description: 'Spent 1+ hour studying' });
    }

    const analytics: AnalyticsData = {
      totalQuizzes,
      totalAttempts,
      averageScore: Math.round(averageScore),
      bestScore: Math.round(bestScore),
      improvementRate: Math.round(improvementRate),
      weeklyDelta: Math.round(weeklyDelta),
      daysStudiedThisWeek: daysStudiedSet.size,
      weeklyAttempts: weeklyAttemptsList.length,
      todayStudyTime,
      weekStudyTime,
      totalStudyTime,
      trend,
      recentActivity,
      topQuizzes,
      weakAreas: weakAreas.slice(0, 3),
      mostMissedQuizzes,
      focusArea,
      recommendedQuizId: recommendedQuiz ? recommendedQuiz.quiz.id : null,
      recommendedQuizTitle: recommendedQuiz ? recommendedQuiz.quiz.title : 'Any recent quiz',
      focusGoal,
      badges: badges.slice(0, 4),
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Error building analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to build analytics',
      },
      { status: 500 }
    );
  }
}
