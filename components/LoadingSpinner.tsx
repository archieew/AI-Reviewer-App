// =============================================
// Loading Spinner Component
// =============================================
// Animated loading indicator

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  text,
  className,
}: LoadingSpinnerProps) {
  // Size mappings
  const sizeStyles = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      {/* Spinner */}
      <div
        className={cn(
          'rounded-full border-4 border-gray-200 border-t-primary animate-spin',
          sizeStyles[size]
        )}
      />

      {/* Loading text */}
      {text && (
        <p className={cn('text-gray-600 font-medium', textSizes[size])}>
          {text}
        </p>
      )}
    </div>
  );
}
