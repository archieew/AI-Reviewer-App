// =============================================
// Configure Page
// =============================================
// Quiz settings selection page

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTION_TYPES, QUIZ_LENGTH_OPTIONS, QuestionType } from '@/config/questions';
import { APP_CONTENT } from '@/config/content';
import QuizTypeCard from '@/components/QuizTypeCard';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/LoadingSpinner';

interface UploadedData {
  filename: string;
  content: string;
  metadata?: {
    slideCount?: number;
    pageCount?: number;
  };
}

export default function ConfigurePage() {
  const router = useRouter();
  
  // State
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);
  const [selectedType, setSelectedType] = useState<QuestionType>('multiple_choice');
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load uploaded content from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('uploadedContent');
    if (stored) {
      try {
        setUploadedData(JSON.parse(stored));
      } catch {
        // Invalid data, redirect to home
        router.push('/');
      }
    } else {
      // No data, redirect to home
      router.push('/');
    }
  }, [router]);

  // Handle quiz generation
  const handleGenerate = async () => {
    if (!uploadedData) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Call the generate API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: uploadedData.content,
          filename: uploadedData.filename,
          questionType: selectedType,
          questionCount: questionCount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      // Clear sessionStorage
      sessionStorage.removeItem('uploadedContent');

      // Navigate to the quiz page
      router.push(`/quiz/${data.quizId}`);
    } catch (err) {
      console.error('Generate error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  // Show loading if no data yet
  if (!uploadedData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <section className="text-center mb-8 animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configure Your Quiz
        </h1>
        <p className="text-gray-600">
          Choose your quiz settings for{' '}
          <span className="font-medium text-primary">{uploadedData.filename}</span>
        </p>
        {uploadedData.metadata?.slideCount && (
          <p className="text-sm text-gray-500 mt-1">
            {uploadedData.metadata.slideCount} slides detected
          </p>
        )}
        {uploadedData.metadata?.pageCount && (
          <p className="text-sm text-gray-500 mt-1">
            {uploadedData.metadata.pageCount} pages detected
          </p>
        )}
      </section>

      {/* Question Type Selection */}
      <section className="mb-8 animate-slideUp">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Question Type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(QUESTION_TYPES).map((type) => (
            <QuizTypeCard
              key={type.id}
              type={type}
              isSelected={selectedType === type.id}
              onSelect={() => setSelectedType(type.id)}
            />
          ))}
        </div>
      </section>

      {/* Question Count */}
      <section className="mb-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Number of Questions
        </h2>
        <div className="flex flex-wrap gap-3">
          {QUIZ_LENGTH_OPTIONS.map((count) => (
            <button
              key={count}
              onClick={() => setQuestionCount(count)}
              className={`
                px-6 py-3 rounded-xl font-medium transition-all
                ${
                  questionCount === count
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary'
                }
              `}
            >
              {count}
            </button>
          ))}
        </div>
      </section>

      {/* Preview Summary */}
      <section className="mb-8 bg-white rounded-2xl p-6 shadow-sm animate-slideUp" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quiz Summary
        </h2>
        <div className="space-y-2 text-gray-600">
          <p>
            <span className="font-medium">Type:</span>{' '}
            {QUESTION_TYPES[selectedType].icon} {QUESTION_TYPES[selectedType].name}
          </p>
          <p>
            <span className="font-medium">Questions:</span> {questionCount}
          </p>
          <p>
            <span className="font-medium">Source:</span> {uploadedData.filename}
          </p>
        </div>
      </section>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <section className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp" style={{ animationDelay: '0.3s' }}>
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          disabled={isGenerating}
        >
          Back
        </Button>
        <Button
          onClick={handleGenerate}
          isLoading={isGenerating}
          size="lg"
        >
          {isGenerating ? APP_CONTENT.messages.generating : APP_CONTENT.buttons.startQuiz}
        </Button>
      </section>

      {/* Generation message */}
      {isGenerating && (
        <div className="mt-8 text-center animate-fadeIn">
          <LoadingSpinner text={APP_CONTENT.messages.generating} />
          <p className="text-sm text-gray-500 mt-4">
            This may take a moment depending on the content size...
          </p>
        </div>
      )}
    </div>
  );
}
