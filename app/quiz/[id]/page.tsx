// =============================================
// Quiz Page — Game Mode
// =============================================
// Duolingo/Kahoot-style quiz: instant feedback,
// hearts, speed timer, combo points

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Question, QuizWithQuestions } from '@/lib/types';
import { APP_CONTENT } from '@/config/content';
import { GAME_CONFIG, XP_PER_CORRECT, pointsForAnswer } from '@/lib/game';
import QuestionCard from '@/components/QuestionCard';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/LoadingSpinner';

type GamePhase = 'playing' | 'feedback' | 'gameover';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  // Quiz data state
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Game state
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hearts, setHearts] = useState<number>(GAME_CONFIG.hearts);
  const [points, setPoints] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(GAME_CONFIG.secondsPerQuestion);
  const [startTime, setStartTime] = useState(Date.now());

  // Keep the latest typed answer for identification questions
  const pendingAnswerRef = useRef<string>('');

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

  const currentQuestion: Question | undefined = quiz?.questions[currentIndex];
  const totalQuestions = quiz?.questions.length || 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // Check the given answer for the current question and enter feedback phase
  const checkAnswer = useCallback(
    (answer: string) => {
      if (!currentQuestion) return;

      const isCorrect =
        answer.toLowerCase().trim() === currentQuestion.correct_answer.toLowerCase().trim();

      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
      setLastAnswerCorrect(isCorrect);

      if (isCorrect) {
        const newCombo = combo + 1;
        const earned = pointsForAnswer(secondsLeft, newCombo);
        setCombo(newCombo);
        setMaxCombo((prev) => Math.max(prev, newCombo));
        setPoints((prev) => prev + earned);
        setCorrectCount((prev) => prev + 1);
        setLastPointsEarned(earned);
        setPhase('feedback');
      } else {
        const remaining = hearts - 1;
        setCombo(0);
        setLastPointsEarned(0);
        setHearts(remaining);
        setPhase(remaining <= 0 ? 'gameover' : 'feedback');
      }
    },
    [currentQuestion, combo, secondsLeft, hearts]
  );

  // Countdown timer while playing
  useEffect(() => {
    if (phase !== 'playing' || isLoading || !currentQuestion) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isLoading, currentQuestion]);

  // Time ran out: counts as a wrong answer
  useEffect(() => {
    if (secondsLeft <= 0 && phase === 'playing' && currentQuestion) {
      checkAnswer(pendingAnswerRef.current || '');
    }
  }, [secondsLeft, phase, currentQuestion, checkAnswer]);

  // Answer selection from QuestionCard
  const handleAnswerSelect = (answer: string) => {
    if (phase !== 'playing' || !currentQuestion) return;

    if (currentQuestion.type === 'identification') {
      // Typed answers are checked via the CHECK button, not per keystroke
      pendingAnswerRef.current = answer;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
    } else {
      // Multiple choice / true-false: check immediately (Kahoot style)
      checkAnswer(answer);
    }
  };

  // Submit the finished quiz to the existing API
  const handleSubmit = useCallback(async () => {
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

      // Hand the session game stats to the results page
      sessionStorage.setItem(
        'gameSession',
        JSON.stringify({ quizId, points, maxCombo, heartsLeft: hearts })
      );

      router.push(`/results/${quizId}?attemptId=${data.attemptId}`);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      setIsSubmitting(false);
    }
  }, [quiz, quizId, answers, startTime, points, maxCombo, hearts, router]);

  // Continue to next question (or finish)
  const handleContinue = () => {
    if (isLastQuestion) {
      handleSubmit();
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSecondsLeft(GAME_CONFIG.secondsPerQuestion);
    setLastAnswerCorrect(null);
    pendingAnswerRef.current = '';
    setPhase('playing');
  };

  // Restart after running out of hearts
  const handleRetry = () => {
    setPhase('playing');
    setCurrentIndex(0);
    setAnswers({});
    setHearts(GAME_CONFIG.hearts);
    setPoints(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setLastAnswerCorrect(null);
    setLastPointsEarned(0);
    setSecondsLeft(GAME_CONFIG.secondsPerQuestion);
    setStartTime(Date.now());
    pendingAnswerRef.current = '';
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
        <div className="bg-red-50 rounded-clay shadow-clay-sm p-8">
          <h2 className="text-xl font-bold text-red-700 mb-2">
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

  // Game over screen (out of hearts)
  if (phase === 'gameover') {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center animate-fadeIn">
        <div className="clay-lg p-10">
          <div className="text-8xl mb-4 animate-shake">💔</div>
          <h1 className="text-3xl font-extrabold text-ink mb-2">Out of Hearts!</h1>
          <p className="text-ink-soft mb-6">
            You made it to question {currentIndex + 1} of {totalQuestions}. Take a breath and
            try again — you've got this!
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="clay-sm py-3">
              <p className="text-2xl font-extrabold text-primary">{points.toLocaleString()}</p>
              <p className="text-xs font-bold tracking-wider text-ink-soft">POINTS</p>
            </div>
            <div className="clay-sm py-3">
              <p className="text-2xl font-extrabold text-gold">🔥 {maxCombo}</p>
              <p className="text-xs font-bold tracking-wider text-ink-soft">BEST COMBO</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleRetry}>
              ▶ Try Again
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push(`/flashcards/${quizId}`)}>
              🃏 Practice First
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const timerPercent = Math.max(0, (secondsLeft / GAME_CONFIG.secondsPerQuestion) * 100);
  const timerColor =
    timerPercent > 50 ? 'from-success to-[#4ade80]' : timerPercent > 25 ? 'from-amber-400 to-gold' : 'from-red-400 to-red-500';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Quiz title */}
      <div className="text-center mb-4 animate-fadeIn">
        <h1 className="text-2xl font-extrabold text-ink">{quiz.title}</h1>
      </div>

      {/* Game HUD: progress, hearts, points */}
      <div className="mb-4 flex items-center gap-3 animate-fadeIn">
        {/* Question progress */}
        <div className="clay-inset flex-1 h-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-light to-primary shadow-[inset_0_-3px_5px_rgba(0,0,0,0.12),inset_0_3px_5px_rgba(255,255,255,0.5)] transition-all duration-500"
            style={{ width: `${((currentIndex + (phase === 'feedback' ? 1 : 0)) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Hearts */}
        <div className="clay-sm px-3 py-1.5 text-sm tracking-wider flex-shrink-0" title={`${hearts} hearts left`}>
          {'❤️'.repeat(hearts)}
          {'🖤'.repeat(Math.max(0, GAME_CONFIG.hearts - hearts))}
        </div>

        {/* Points */}
        <div className="clay-sm px-3 py-1.5 text-center flex-shrink-0">
          <span className="block text-sm font-extrabold text-primary leading-tight">
            {points.toLocaleString()}
          </span>
          <span className="block text-[9px] font-bold tracking-widest text-ink-soft">PTS</span>
        </div>
      </div>

      {/* Speed timer */}
      <div className="mb-6 flex items-center gap-3 animate-fadeIn">
        <span className="text-lg" aria-hidden="true">⏱️</span>
        <div className="clay-inset flex-1 h-3 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${timerColor} shadow-[inset_0_2px_3px_rgba(255,255,255,0.4)] transition-all duration-1000 ease-linear`}
            style={{ width: `${phase === 'playing' ? timerPercent : 0}%` }}
          />
        </div>
        <span
          className={`text-sm font-extrabold w-8 text-right ${
            phase === 'playing' && secondsLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-ink-soft'
          }`}
        >
          {phase === 'playing' ? `${Math.max(0, secondsLeft)}s` : '—'}
        </span>
      </div>

      {/* Question card with instant feedback */}
      <div className="mb-4 animate-slideUp" key={currentQuestion.id}>
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          selectedAnswer={answers[currentQuestion.id] || null}
          onAnswerSelect={handleAnswerSelect}
          showResult={phase === 'feedback'}
          disabled={phase === 'feedback'}
          quizId={quizId}
        />
      </div>

      {/* Feedback banner */}
      {phase === 'feedback' && (
        <div
          className={`mb-4 p-4 rounded-clay-sm shadow-clay-sm text-center animate-fadeIn ${
            lastAnswerCorrect
              ? 'bg-gradient-to-br from-[#e9fbf1] to-[#d7f8e6]'
              : 'bg-gradient-to-br from-[#fef1f1] to-[#fde2e2]'
          }`}
        >
          {lastAnswerCorrect ? (
            <p className="font-extrabold text-green-700">
              ✓ Correct! +{lastPointsEarned} pts · +{XP_PER_CORRECT} XP
              {combo >= 3 && <span className="ml-2 text-amber-600">🔥 {combo}-answer combo!</span>}
            </p>
          ) : (
            <p className="font-extrabold text-red-600">
              ✗ {secondsLeft <= 0 ? "Time's up!" : 'Not quite!'} You lost a heart 💔
            </p>
          )}
        </div>
      )}

      {/* Action button */}
      <div className="animate-slideUp">
        {phase === 'feedback' ? (
          <Button
            variant={lastAnswerCorrect ? 'success' : 'primary'}
            size="lg"
            className="w-full"
            onClick={handleContinue}
            isLoading={isSubmitting}
          >
            {isLastQuestion ? '🏁 FINISH' : 'CONTINUE →'}
          </Button>
        ) : currentQuestion.type === 'identification' ? (
          <Button
            size="lg"
            className="w-full"
            onClick={() => checkAnswer(pendingAnswerRef.current)}
            disabled={!(answers[currentQuestion.id] || '').trim()}
          >
            CHECK ✓
          </Button>
        ) : (
          <p className="text-center text-sm text-ink-soft">
            Pick an answer — faster answers earn more points! ⚡
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-clay-sm shadow-clay-sm">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
