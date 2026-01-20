// =============================================
// Progress Bar Component
// =============================================
// Shows quiz progress with animated bar

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  current,
  total,
  showLabel = true,
  className,
}: ProgressBarProps) {
  // Calculate percentage
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-700">
            {current} / {total}
          </span>
        </div>
      )}

      {/* Progress bar container */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* Progress bar fill */}
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
