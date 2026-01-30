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

// Confetti component for celebration
const Confetti = () => {
  const colors = ['#7c3aed', '#f472b6', '#10b981', '#f59e0b', '#3b82f6'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: '10px',
            height: '10px',
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const quizId = params.id as string;
  const attemptId = searchParams.get('attemptId');

  // State
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [allAttempts, setAllAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedAttempts, setSelectedAttempts] = useState<string[]>([]);

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

        // Fetch all attempts for this quiz
        const attemptsResponse = await fetch(`/api/quizzes`);
        const attemptsData = await attemptsResponse.json();
        let attempts: Attempt[] = [];
        if (attemptsData.success) {
          const quizWithAttempts = attemptsData.quizzes.find((q: any) => q.id === quizId);
          if (quizWithAttempts?.attempts) {
            const sorted = [...quizWithAttempts.attempts].sort(
              (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
            );
            attempts = sorted;
            setAllAttempts(sorted);
          }
        }

        // Fetch attempt if attemptId is provided
        if (attemptId) {
          const attemptResponse = await fetch(`/api/attempts/${attemptId}`);
          const attemptData = await attemptResponse.json();

          if (attemptResponse.ok && attemptData.success) {
            setAttempt(attemptData.attempt);
          }
        } else if (attempts.length > 0) {
          // Use most recent attempt if no attemptId provided
          setAttempt(attempts[0]);
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
  const isPassing = percentage >= 60;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Confetti for passing scores */}
      {isPassing && <Confetti />}

      {/* Results Header */}
      <section className="text-center mb-8 animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {APP_CONTENT.messages.quizComplete}
        </h1>
        <p className="text-gray-600">{quiz.title}</p>
      </section>

      {/* Celebration Section */}
      {isPassing ? (
        <section className="text-center mb-6 animate-celebrate">
          <div className="text-8xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">
            Congratulations! You Passed! 🎊
          </h2>
          <p className="text-lg text-gray-700">
            Great job! Your hard work is paying off!
          </p>
        </section>
      ) : (
        <section className="text-center mb-6 animate-fadeInUp">
          <div className="text-8xl mb-4 animate-shake">😔</div>
          <h2 className="text-3xl font-bold text-orange-600 mb-2">
            Don't Give Up! 💪
          </h2>
          <p className="text-lg text-gray-700 max-w-md mx-auto">
            Every expert was once a beginner. Keep practicing and you'll get there!
          </p>
        </section>
      )}

      {/* Score Card */}
      <section className={`bg-white rounded-3xl shadow-lg p-8 mb-8 text-center animate-slideUp ${
        isPassing ? 'border-4 border-green-200' : 'border-4 border-orange-200'
      }`}>
        {/* Big score display */}
        <div className={`mb-6 ${isPassing ? 'animate-celebrate' : ''}`}>
          <span className={`text-6xl font-bold ${getScoreColor(score, total)}`}>
            {score}
          </span>
          <span className="text-4xl text-gray-400">/{total}</span>
        </div>

        {/* Percentage */}
        <div className="mb-6">
          <div className={`inline-block px-6 py-2 rounded-full ${
            isPassing ? 'bg-green-100' : 'bg-orange-100'
          }`}>
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
        <div className={`mt-6 p-6 rounded-xl ${
          isPassing
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
            : 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200'
        }`}>
          {isPassing ? (
            <div>
              <p className="text-xl font-semibold text-green-700 mb-2">
                {percentage >= 80
                  ? '🌟 Outstanding Performance!'
                  : '🎯 Well Done! You Passed!'}
              </p>
              <p className="text-base text-green-600">
                {percentage >= 80
                  ? 'You really know your stuff! Keep up the excellent work!'
                  : 'Good job! Keep studying to reach even higher scores!'}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xl font-semibold text-orange-700 mb-2">
                💪 Keep Going! You've Got This!
              </p>
              <p className="text-base text-orange-600 mb-3">
                Don't be discouraged. Every mistake is a learning opportunity. Review the questions you got wrong and try again!
              </p>
              <div className="mt-4 p-3 bg-white/50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Tip:</strong> Use the flashcard mode to focus on the questions you missed. 
                  Practice makes perfect! 📚
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Action Buttons */}
      <section className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-slideUp">
        <Link href={`/quiz/${quizId}`}>
          <Button variant="outline" leftIcon={<span>🔄</span>}>
            {APP_CONTENT.buttons.retakeQuiz}
          </Button>
        </Link>
        {allAttempts.length > 1 && (
          <Button
            variant="outline"
            onClick={() => setShowCompare(!showCompare)}
            leftIcon={<span>📊</span>}
          >
            {showCompare ? 'Hide' : 'Compare'} Attempts
          </Button>
        )}
        <Link href={`/flashcards/${quizId}`}>
          <Button variant="outline" leftIcon={<span>🃏</span>}>
            Flashcard Mode
          </Button>
        </Link>
        <Link href="/">
          <Button leftIcon={<span>🏠</span>}>
            {APP_CONTENT.buttons.backToHome}
          </Button>
        </Link>
      </section>

      {/* Compare Attempts Section */}
      {showCompare && allAttempts.length > 1 && (
        <section className="mb-8 animate-slideUp">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Compare Your Attempts
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Score</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Time</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allAttempts.map((att, index) => {
                  const attPercentage = Math.round((att.score / att.total) * 100);
                  const isImproving = index > 0 && 
                    (att.score / att.total) > (allAttempts[index - 1].score / allAttempts[index - 1].total);
                  const isDeclining = index > 0 && 
                    (att.score / att.total) < (allAttempts[index - 1].score / allAttempts[index - 1].total);
                  
                  return (
                    <tr
                      key={att.id}
                      className={`border-b border-gray-100 ${
                        att.id === attempt?.id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">
                          {new Date(att.completed_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(att.completed_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className={`text-lg font-bold ${getScoreColor(att.score, att.total)}`}>
                          {formatPercentage(att.score, att.total)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {att.score}/{att.total} correct
                        </div>
                        {isImproving && (
                          <div className="text-xs text-green-600 mt-1">↑ Improved!</div>
                        )}
                        {isDeclining && (
                          <div className="text-xs text-orange-600 mt-1">↓ Needs work</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-700">
                        {formatDuration(att.time_spent)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/results/${quizId}?attemptId=${att.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Improvement Summary */}
            {allAttempts.length >= 2 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2">Progress Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">First Attempt: </span>
                    <span className="font-semibold">
                      {formatPercentage(allAttempts[allAttempts.length - 1].score, allAttempts[allAttempts.length - 1].total)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Latest Attempt: </span>
                    <span className="font-semibold">
                      {formatPercentage(allAttempts[0].score, allAttempts[0].total)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-700">Improvement: </span>
                    <span className={`font-semibold ${
                      (allAttempts[0].score / allAttempts[0].total) > 
                      (allAttempts[allAttempts.length - 1].score / allAttempts[allAttempts.length - 1].total)
                        ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {Math.round(
                        ((allAttempts[0].score / allAttempts[0].total) - 
                         (allAttempts[allAttempts.length - 1].score / allAttempts[allAttempts.length - 1].total)) * 100
                      )}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

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
                quizId={quizId}
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
