// =============================================
// Bible Verse Card Component
// =============================================
// Displays the daily Bible verse fetched from API

'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Verse type definition
interface Verse {
  text: string;
  reference: string;
}

interface VerseCardProps {
  className?: string;
}

export default function VerseCard({ className }: VerseCardProps) {
  // State for the verse data
  const [verse, setVerse] = useState<Verse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch verse from API on component mount
  useEffect(() => {
    const fetchVerse = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/verse');
        const data = await response.json();

        if (data.success && data.verse) {
          setVerse(data.verse);
        } else {
          throw new Error('Failed to fetch verse');
        }
      } catch (err) {
        console.error('Error fetching verse:', err);
        setError('Could not load verse');
        // Set a fallback verse
        setVerse({
          text: "I can do all things through Christ who strengthens me.",
          reference: "Philippians 4:13",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerse();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          'relative p-6 rounded-2xl',
          'bg-white/70 backdrop-blur-sm',
          'border-l-4 border-accent',
          'shadow-sm animate-pulse',
          className
        )}
      >
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4 mt-3"></div>
      </div>
    );
  }

  // If no verse loaded (shouldn't happen with fallback)
  if (!verse) {
    return null;
  }

  return (
    <div
      className={cn(
        // Container styles
        'relative p-6 rounded-2xl',
        'bg-white/70 backdrop-blur-sm',
        'border-l-4 border-accent',
        'shadow-sm',
        className
      )}
    >
      {/* Verse text */}
      <p className="text-gray-700 italic leading-relaxed">
        &ldquo;{verse.text}&rdquo;
      </p>

      {/* Reference */}
      <span className="block mt-3 text-sm font-medium text-primary">
        — {verse.reference}
      </span>

      {/* Error indicator (subtle, only shows if there was an error but fallback worked) */}
      {error && (
        <span className="absolute top-2 right-2 text-xs text-gray-400">
          offline
        </span>
      )}
    </div>
  );
}
