// =============================================
// Question Types Configuration
// =============================================
// Define question types and their properties
// Easy to add new question types here

export type QuestionType = 'multiple_choice' | 'identification' | 'true_false' | 'mixed';

export interface QuestionTypeConfig {
  id: QuestionType;
  name: string;
  description: string;
  icon: string;
  // Number of options (for multiple choice)
  optionCount?: number;
}

export const QUESTION_TYPES: Record<QuestionType, QuestionTypeConfig> = {
  multiple_choice: {
    id: 'multiple_choice',
    name: 'Multiple Choice',
    description: '4 options per question, test your knowledge',
    icon: '🎯',
    optionCount: 4,
  },
  identification: {
    id: 'identification',
    name: 'Identification',
    description: 'Fill in the blanks, recall key terms',
    icon: '✍️',
  },
  true_false: {
    id: 'true_false',
    name: 'True or False',
    description: 'Evaluate statements as true or false',
    icon: '⚖️',
    optionCount: 2,
  },
  mixed: {
    id: 'mixed',
    name: 'Mixed Mode',
    description: 'Combination of all question types',
    icon: '🔀',
  },
};

// Quiz length options
export const QUIZ_LENGTH_OPTIONS = [5, 10, 15, 20, 25, 30];

// Default quiz settings
export const DEFAULT_QUIZ_SETTINGS = {
  questionType: 'multiple_choice' as QuestionType,
  questionCount: 10,
  shuffleQuestions: true,
  showExplanations: true,
};
