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
          <span className="text-sm font-semibold text-ink-soft">Progress</span>
          <span className="text-sm font-bold text-ink">
            {current} / {total}
          </span>
        </div>
      )}

      {/* Pressed-in clay track */}
      <div className="clay-inset w-full h-4 overflow-hidden">
        {/* Game-style green fill with clay highlight */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-success to-[#4ade80] shadow-[inset_0_-3px_5px_rgba(0,0,0,0.12),inset_0_3px_5px_rgba(255,255,255,0.5)] transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
