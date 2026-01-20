// =============================================
// Content Configuration
// =============================================
// All text content in one place - easy to customize!
// Change app name, taglines, and messages here

export const APP_CONTENT = {
  // App identity
  name: "Bebe's Reviewer",
  shortName: "Bebe's",
  
  // Can be changed to:
  // name: "Bebe's OT Reviewer",
  // name: "OT Study Buddy",
  
  // Main tagline shown on homepage
  tagline: "Study Smarter, Not Harder 💜",
  
  // Subtitle under tagline
  subtitle: "Upload your PowerPoint reviewer and let AI create personalized quizzes for you",
  
  // Can be changed to:
  // tagline: "Ace your OT boards, one quiz at a time",
  // subtitle: "Upload your OT materials and let AI create personalized quizzes",
  
  // Footer message
  footer: "Made for Bebe 💜",
  
  // Logo/icon emoji
  icon: "📚",
  // Can be: "🤲" for OT hands theme
  
  // Navigation items
  nav: {
    home: "Home",
    history: "History",
  },
  
  // Upload section
  upload: {
    title: "Drop your file here",
    subtitle: "or browse to choose a file",
    supportedFormats: [".pptx", ".ppt", ".pdf"],
  },
  
  // Quiz type descriptions
  quizTypes: {
    multipleChoice: {
      name: "Multiple Choice",
      description: "4 options per question, test your knowledge",
      icon: "🎯",
    },
    identification: {
      name: "Identification",
      description: "Fill in the blanks, recall key terms",
      icon: "✍️",
    },
    trueFalse: {
      name: "True or False",
      description: "Evaluate statements as true or false",
      icon: "⚖️",
    },
    mixed: {
      name: "Mixed Mode",
      description: "Combination of all question types",
      icon: "🔀",
    },
  },
  
  // Button labels
  buttons: {
    startQuiz: "Start Quiz",
    submit: "Submit",
    nextQuestion: "Next",
    previousQuestion: "Previous",
    viewResults: "View Results",
    retakeQuiz: "Retake Quiz",
    backToHome: "Back to Home",
    viewHistory: "View Past Quizzes",
  },
  
  // Messages
  messages: {
    generating: "AI is creating your quiz...",
    noQuizzes: "No quizzes yet. Upload a file to get started!",
    quizComplete: "Quiz Complete!",
    uploadSuccess: "File uploaded successfully!",
    uploadError: "Failed to upload file. Please try again.",
  },
} as const;
