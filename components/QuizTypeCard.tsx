// =============================================
// Quiz Type Selection Card
// =============================================
// Card for selecting question type in configure page

import { cn } from '@/lib/utils';
import { QuestionTypeConfig } from '@/config/questions';

interface QuizTypeCardProps {
  type: QuestionTypeConfig;
  isSelected: boolean;
  onSelect: () => void;
}

export default function QuizTypeCard({
  type,
  isSelected,
  onSelect,
}: QuizTypeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        // Base styles: puffy clay tile
        'w-full p-6 rounded-clay text-left transition-all duration-200',
        'border-2 hover:-translate-y-1',
        // Default state
        !isSelected && 'border-transparent bg-white shadow-clay-sm hover:shadow-clay-md',
        // Selected state
        isSelected && 'border-primary/40 bg-gradient-to-br from-[#ede4ff] to-[#e2d4ff] shadow-clay-md'
      )}
    >
      {/* Icon */}
      <span className="text-3xl mb-3 block">{type.icon}</span>

      {/* Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{type.name}</h3>

      {/* Description */}
      <p className="text-sm text-gray-500">{type.description}</p>

      {/* Selected indicator */}
      {isSelected && (
        <div className="mt-4 flex items-center gap-2 text-primary">
          <span className="text-sm font-medium">Selected</span>
          <span>✓</span>
        </div>
      )}
    </button>
  );
}
